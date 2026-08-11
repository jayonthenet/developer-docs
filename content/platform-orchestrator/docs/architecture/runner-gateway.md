---
title: "Runner gateway"
description: "How runner commands, results, and logs cross network boundaries."
draft: false
type: docs
weight: 20
toc: true
---

The runner gateway keeps the public runner protocol deliberately boring: outbound HTTPS. NATS JetStream is an internal implementation detail of the Orchestrator and, for air-gapped installations, of the protected compartment.

```text
                    Orchestrator cluster
  data plane ──publish──> JetStream <──> runner gateway
                                             ▲
                                             │ outbound HTTPS long poll
                                             │ commands, results, encrypted logs
                                             │
                                      runner agent / Job
```

The data plane never opens a connection to a runner Pod. A Kubernetes agent long-polls its runner-specific command endpoint. A direct Kubernetes or ECS runner Job uses the same gateway for its deployment bundle, result, and encrypted log uploads.

JetStream buffers commands centrally when a runner is offline. In edge mode, a persistent HTTPS outbox also buffers results and encrypted logs in the runner cluster when the return path is unavailable.

## Authentication

- A Kubernetes agent signs a short-lived Ed25519 JWT with its private key. The matching public key is stored in the runner registration.
- A deployment Job receives a deployment-scoped token from the data plane. It does not receive NATS credentials.
- TLS authenticates the gateway. A private CA and mutual TLS are optional chart settings.
- Command receipts are encrypted and can be processed by any gateway replica. No sticky session is required.

Keep the agent private key in a Kubernetes Secret. Rotate a key by updating the runner registration and Secret together. Do not place private keys or deployment tokens in Helm values committed to source control.

## Operating modes

### Simple

Use `gateway.mode=simple`. The agent reaches the central HTTPS endpoint, normally `https://<api-host>/runner-gateway`. Commands are durable in central JetStream. No runner-side broker or outbox is required.

### Edge

Use `gateway.mode=edge` and enable `outbox.enabled`. Connectivity may be intermittent. Commands remain buffered centrally; deployment results and encrypted logs remain on the configured `ReadWriteMany` volume until the HTTPS gateway is reachable again.

The agent connection is long-lived HTTP, but correctness does not depend on a particular connection or gateway replica. Normal load balancing is supported.

### Air-gapped

Use `gateway.mode=airgap`. The runner chart deploys a small protected-side gateway and a single-node protected JetStream. The agent and deployment Jobs speak only HTTP to that local gateway.

Commands and bundles cross the boundary through a signed file relay into the protected JetStream. Results and encrypted logs require a separately authorized reverse relay. A physically one-way diode cannot, by definition, carry logs back. Deployments still run if the reverse path is delayed, but their final result and logs remain protected-side until transferred.

The protected gateway Secret must contain:

| Key | Content |
| --- | --- |
| `public-key.pem` | Public half of the agent Ed25519 key |
| `runner-token-salt` | The central data plane `RUNNER_TOKEN_SALT` |
| `receipt-key` | Base64 encoding of exactly 32 random bytes |

The protected NATS token is a separate Secret used only by the protected gateway and diode relay. It is never given to the runner agent or deployment Jobs.

{{< alert context="warning" >}}
The software relay path can be rendered and tested without a physical device. Qualification with the selected diode, including media semantics, replay handling, capacity, monitoring, and the reverse path, is a separate production acceptance requirement.
{{< /alert >}}

## Deploy a Kubernetes agent

All modes use the same runner registration and Ed25519 identity. Generate the
identity, register `runner_public_key.pem` as the `kubernetes-agent` runner's
public `key`, and store only the private half in the target cluster:

```bash
openssl genpkey -algorithm ED25519 -out runner_private_key.pem
openssl pkey -in runner_private_key.pem -pubout -out runner_public_key.pem
kubectl create secret generic runner-identity \
  --from-file=private-key.pem=runner_private_key.pem
```

For simple mode:

```bash
helm install runner \
  oci://ghcr.io/stellwerk-labs/charts/platform-orchestrator-kubernetes-agent-runner \
  --version 0.3.0 \
  --set platformOrchestrator.orgId=my-org \
  --set platformOrchestrator.runnerId=my-runner \
  --set gateway.mode=simple \
  --set gateway.url=https://api.example.com/runner-gateway \
  --set gateway.privateKeyExistingSecret=runner-identity
```

For edge mode, use the same values plus an RWX outbox:

```yaml
gateway:
  mode: edge
  url: https://api.example.com/runner-gateway
  privateKeyExistingSecret: runner-identity
outbox:
  enabled: true
  storageClassName: rwx-storage
  size: 5Gi
```

For air-gap mode, create a protected gateway Secret containing the three keys
listed above, create a separate protected NATS credential Secret, and set:

```yaml
gateway:
  mode: airgap
  privateKeyExistingSecret: runner-identity
protected-nats:
  enabled: true
  container:
    env:
      NATS_AUTH_TOKEN:
        valueFrom:
          secretKeyRef:
            name: protected-nats-credentials
            key: token
airgap:
  gatewaySecret: protected-gateway
  nats:
    existingSecret: protected-nats-credentials
```

The [Kubernetes agent setup guide]({{< relref "/platform-orchestrator/docs/configure/runners/runner-types/kubernetes-agent" >}})
contains complete Terraform/OpenTofu and Helm workflows, private-CA settings,
and the required runner registration.

## Availability and scaling

Run at least two central gateway replicas. Replicas are stateless apart from short-lived public-key and consumer caches; JetStream and encrypted receipts carry durable state. Scale gateways horizontally based on concurrent long polls, request rate, and log upload throughput.

Gateway failure does not lose queued commands. Agent failure does not lose unacknowledged commands. In edge mode, an outbox volume failure can lose results that have not yet reached the gateway, so use a storage class with the availability and backup characteristics your recovery objective requires.
