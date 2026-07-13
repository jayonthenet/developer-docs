---
title: "kubernetes-eks"
description: "The `kubernetes-eks` runner type lets you execute runners on Amazon Elastic Kubernetes Service (EKS) clusters having a publicly accessible API server."
draft: false
type: docs
weight: 100
toc: true
---

{{% description %}}

The Orchestrator will create Kubernetes Jobs directly. This runner type does not require a [runner agent]({{< relref "/platform-orchestrator/docs/configure/runners/overview#runner-agent" >}}).

To access the cluster, the Orchestrator uses temporary credentials obtained via [AWS Security Token Service (STS)](https://docs.aws.amazon.com/STS/latest/APIReference/welcome.html) by assuming an IAM role with minimal required permissions.

Follow the steps below to configure a runner of type `kubernetes-eks`.

## Basic example

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
resource "platform-orchestrator_kubernetes_eks_runner" "my_runner" {
  id = "my-runner"
  runner_configuration = {
    cluster = {
      name   = "my-eks-cluster"
      region = "us-west-2"
      auth = {
        role_arn = "arn:aws:iam::123456789012:role/platform-orchestrator-runner-eks-role"
      }
    }
    job = {
      namespace       = "default"
      service_account = "canyon-runner"
    }
  }
  state_storage_configuration = {
    # ...
  }
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
octl create runner my-runner --set-yaml=@runner-config.yaml
```

where `runner-config.yaml` is:

```yaml
runner_configuration:
  type: kubernetes-eks
  cluster:
    name: my-eks-cluster
    region: us-west-2
    auth:
      role_arn: arn:aws:iam::123456789012:role/platform-orchestrator-runner-eks-role
  job:
    namespace: platform-orchestrator-runner
    service_account: platform-orchestrator-runner
state_storage_configuration:
  ...
```

{{% /tab %}}
{{< /tabs >}}

## Configuration

{{< tabs >}}
{{% tab name="TF" %}}

Refer to the resource schema in the [Terraform](https://registry.terraform.io/providers/stellwerk-labs/platform-orchestrator/latest/docs/resources/kubernetes_eks_runner#schema) or [OpenTofu](https://search.opentofu.org/provider/stellwerk-labs/platform-orchestrator/latest/docs/resources/kubernetes_eks_runner#schema) Kubernetes EKS runner documentation.

{{% details "Extended example" %}}

{{% github-file filename="/stellwerk-labs/terraform-provider-platform-orchestrator/refs/heads/main/examples/resources/platform-orchestrator_kubernetes_eks_runner/resource.tf" %}}

{{% /details %}}

{{% /tab %}}
{{% tab name="CLI" %}}

A `kubernetes-eks` runner consists of these elements:

```yaml
runner_configuration:
  type: kubernetes-eks
  # Optional description for the runner
  description: "My runner"

  # EKS cluster configuration
  cluster:
    # Name of the EKS cluster
    name: my-eks-cluster
    # AWS region where the cluster is located
    region: us-west-2
    # Authentication configuration
    auth:
      # ARN of the IAM role that the Orchestrator will assume to describe and access cluster
      role_arn: arn:aws:iam::123456789012:role/platform-orchestrator-runner-eks-role
      # (optional, defaults to cluster region) AWS region for STS token requests
      sts_region: eu-center-1
      # (optional, defaults to "{humanitec-org-id}-{runner-id}") Custom session name for the assumed role
      session_name: my-session

  # Kubernetes job configuration
  job:
    # Namespace where runner jobs will be created
    namespace: platform-orchestrator-runner
    # Service account to use for the runner jobs
    service_account: platform-orchestrator-runner
    # (optional) Pod template for customizing runner job pods
    pod_template:
      # Add custom pod specifications here
      # See Kubernetes PodSpec documentation for available options
      ...

# State storage configuration
state_storage_configuration:
  # Add state storeage configuration here
  # See State storage types documentation for available options
  ...
```

{{% /tab %}}
{{< /tabs >}}

## Connectivity

{{< include "/platform-orchestrator/docs/configure/runners/runner-types/include-connectivity-direct-kubernetes-runners.md" >}}

## Before you begin

You will need the following resources and permissions:

- The [`aws` CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) installed and authenticated with a principal having permission to manage IAM roles and policies in the AWS account of the target EKS cluster
- An EKS cluster with a publicly available API server endpoint
- The [`kubectl` CLI](https://kubernetes.io/docs/tasks/tools/#kubectl) installed and the current context set to target the EKS cluster using a principal with permission to create namespaces, service accounts, Roles, and RoleBindings
- The [`octl` CLI]({{< relref "/platform-orchestrator/docs/integrations/cli" >}}) installed and authenticated against your Orchestrator organization
- A [project]({{< relref "/platform-orchestrator/docs/configure/projects" >}}) in your Orchestrator organization

## Prepare the cloud environment

Perform the following setup in the AWS account of the target EKS cluster.

1. Set values

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
locals {
  aws_account_id = "<my-aws-account-id>"
  cluster_name   = "<my-eks-cluster-name>"
  cluster_region = "<my-eks-cluster-region>"
  humanitec_org  = "<my-org>"
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
export AWS_ACCOUNT_ID=<my-aws-account-id>
export CLUSTER_NAME=<my-eks-cluster-name>
export CLUSTER_REGION=<my-eks-cluster-region>
export PO_ORG_ID=<my-org>
```

{{% /tab %}}
{{< /tabs >}}

2. Create an OIDC identity provider for the Orchestrator

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
resource "aws_iam_openid_connect_provider" "humanitec_dev" {
  url = "https://oidc.stellwerk.dev"
  client_id_list = [
    "sts.amazonaws.com",
  ]
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
aws iam create-open-id-connect-provider \
  --url https://oidc.stellwerk.dev \
  --client-id-list sts.amazonaws.com
```

{{% /tab %}}
{{< /tabs >}}

3. Create an IAM role for the Orchestrator

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
locals {
  # ...
  kubernetes_eks_runner_id            = "kubernetes-eks-${local.cluster_name}-${local.cluster_region}"
  kubernetes_eks_runner_iam_role_name = "platform-orchestrator-runner-eks-role"
}

data "aws_iam_policy_document" "runner_kubernetes_eks" {
  version = "2012-10-17"
  statement {
    effect = "Allow"
    principals {
      type        = "Federated"
      identifiers = ["${aws_iam_openid_connect_provider.humanitec_dev.arn}"]
    }
    actions = ["sts:AssumeRoleWithWebIdentity"]
    condition {
      test     = "StringEquals"
      variable = "oidc.stellwerk.dev:aud"
      values   = ["sts.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "oidc.stellwerk.dev:sub"
      values   = ["${local.humanitec_org}+${local.kubernetes_eks_runner_id}"]
    }
  }
}

resource "aws_iam_role" "runner_kubernetes_eks" {
  name               = local.kubernetes_eks_runner_iam_role_name
  assume_role_policy = data.aws_iam_policy_document.runner_kubernetes_eks.json
  description        = "Role for the Orchestrator to access EKS clusters for launching runners"
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
export RUNNER_ID=kubernetes-eks-${CLUSTER_NAME}-${CLUSTER_REGION}
export IAM_ROLE_NAME=platform-orchestrator-runner-eks-role

cat <<EOF > platform-orchestrator-runner-eks-trust-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${AWS_ACCOUNT_ID}:oidc-provider/oidc.stellwerk.dev"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "oidc.stellwerk.dev:aud": "sts.amazonaws.com",
          "oidc.stellwerk.dev:sub": "${PO_ORG_ID}+${RUNNER_ID}"
        }
      }
    }
  ]
}
EOF

aws iam create-role \
  --role-name ${IAM_ROLE_NAME} \
  --assume-role-policy-document file://platform-orchestrator-runner-eks-trust-policy.json \
  --description "Role for the Orchestrator to access EKS clusters for launching runners"
```

{{% /tab %}}
{{< /tabs >}}

4. Create an IAM policy with minimal EKS permissions

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
# Obtain the EKS cluster as a data source if it not available as a resource
data "aws_eks_cluster" "my_cluster" {
  name   = local.cluster_name
  region = local.cluster_region
}

resource "aws_iam_policy" "runner_kubernetes_eks" {
  name        = "platform-orchestrator-runner-eks-policy"
  description = "Minimal permissions for Orchestrator to access EKS clusters"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "eks:DescribeCluster",
        ]
        Resource = "${data.aws_eks_cluster.my_cluster.arn}"
      },
    ]
  })
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
export IAM_POLICY_NAME=platform-orchestrator-runner-eks-policy

cat <<EOF > platform-orchestrator-runner-eks-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "eks:DescribeCluster"
      ],
      "Resource": "arn:aws:eks:${CLUSTER_REGION}:${AWS_ACCOUNT_ID}:cluster/${CLUSTER_NAME}"
    }
  ]
}
EOF

aws iam create-policy \
  --policy-name ${IAM_POLICY_NAME} \
  --policy-document file://platform-orchestrator-runner-eks-policy.json \
  --description "Minimal permissions for the Orchestrator to access EKS clusters"
```

{{% /tab %}}
{{< /tabs >}}

5. Attach the policy to the role

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
resource "aws_iam_role_policy_attachment" "runner_kubernetes_eks" {
  role       = aws_iam_role.runner_kubernetes_eks.name
  policy_arn = aws_iam_policy.runner_kubernetes_eks.arn
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
aws iam attach-role-policy \
  --role-name ${IAM_ROLE_NAME} \
  --policy-arn arn:aws:iam::${AWS_ACCOUNT_ID}:policy/${IAM_POLICY_NAME}
```

{{% /tab %}}
{{< /tabs >}}

6. Add IAM access entries for the role

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
resource "aws_eks_access_entry" "runner_kubernetes_eks" {
  cluster_name  = data.aws_eks_cluster.my_cluster.arn
  principal_arn = aws_iam_role.runner_kubernetes_eks.arn
  type          = "STANDARD"
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
aws eks create-access-entry \
  --cluster-name ${CLUSTER_NAME} \
  --principal-arn arn:aws:iam::${AWS_ACCOUNT_ID}:role/${IAM_ROLE_NAME} \
  --type STANDARD
```

{{% /tab %}}
{{< /tabs >}}

## Prepare the EKS cluster

Perform the following setup on the target EKS cluster for the runner.

1. Create a Kubernetes namespace where your runner will run

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
locals {
  # ...
  kubernetes_eks_runner_k8snamespace = "platform-orchestrator-runner"
}

resource "kubernetes_namespace" "runner_kubernetes_eks" {
  metadata {
    name = local.kubernetes_eks_runner_k8snamespace
  }
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
export RUNNER_K8S_NAMESPACE=platform-orchestrator-runner

kubectl create namespace ${RUNNER_K8S_NAMESPACE}
```

{{% /tab %}}
{{< /tabs >}}

2. Create a Kubernetes service account for the runner

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
locals {
  # ...
  kubernetes_eks_runner_k8sserviceaccount = "platform-orchestrator-runner"
}

resource "kubernetes_service_account" "runner_kubernetes_eks" {
  metadata {
    name      = local.kubernetes_eks_runner_k8sserviceaccount
    namespace = kubernetes_namespace.runner_kubernetes_eks.metadata[0].name
  }
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
export RUNNER_K8S_SA=platform-orchestrator-runner

kubectl create serviceaccount -n ${RUNNER_K8S_NAMESPACE} ${RUNNER_K8S_SA}
```

{{% /tab %}}
{{< /tabs >}}

3. Create and assign a Kubernetes Role

Prepare a [Role](https://kubernetes.io/docs/reference/access-authn-authz/rbac/#role-and-clusterrole) and [RoleBinding](https://kubernetes.io/docs/reference/access-authn-authz/rbac/#rolebinding-and-clusterrolebinding). These permissions enable the Orchestrator to create jobs in the runner namespace with minimal required access.

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
locals {
  kubernetes_eks_runner_k8srole_name = "platform-orchestrator-runner-orchestrator-access"
}

data "aws_caller_identity" "current" {}

resource "kubernetes_role" "runner_kubernetes_eks" {
  metadata {
    name      = local.kubernetes_eks_runner_k8srole_name
    namespace = kubernetes_namespace.runner_kubernetes_eks.metadata[0].name
  }

  rule {
    api_groups = ["batch"]
    resources  = ["jobs"]
    verbs      = ["create", "get"]
  }
  rule {
    api_groups = [""]
    resources  = ["pods", "events"]
    verbs      = ["list"]
  }
}

resource "kubernetes_role_binding" "runner_kubernetes_eks" {
  metadata {
    name      = local.kubernetes_eks_runner_k8srole_name
    namespace = kubernetes_namespace.runner_kubernetes_eks.metadata[0].name
  }
  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = kubernetes_role.runner_kubernetes_eks.metadata[0].name
  }
  subject {
    api_group = "rbac.authorization.k8s.io"
    kind      = "User"
    name      = "arn:aws:sts::${data.aws_caller_identity.current.account_id}:assumed-role/${aws_iam_role.runner_kubernetes_eks.name}/${substr(join("-", [local.humanitec_org, local.kubernetes_eks_runner_id]), 0, 64)}"
    namespace = ""
  }
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
export SESSION_NAME=${PO_ORG_ID}-${RUNNER_ID}
# Ensure session name doesn't exceed 64 characters
export SESSION_NAME=${SESSION_NAME:0:64}

cat << EOF > kubernetes-eks-runner-k8s-role-rolebinding.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: platform-orchestrator-runner-orchestrator-access
  namespace: ${RUNNER_K8S_NAMESPACE}
rules:
  - apiGroups: ["batch"]
    resources: ["jobs"]
    verbs: ["create", "get"]
  - apiGroups: [""]
    resources: ["pods", "events"]
    verbs: ["list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: platform-orchestrator-runner-orchestrator-access
  namespace: ${RUNNER_K8S_NAMESPACE}
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: platform-orchestrator-runner-orchestrator-access
subjects:
- kind: User
  name: arn:aws:sts::${AWS_ACCOUNT_ID}:assumed-role/${IAM_ROLE_NAME}/${SESSION_NAME}
EOF

kubectl apply -f kubernetes-eks-runner-k8s-role-rolebinding.yaml
```

{{% /tab %}}
{{< /tabs >}}

## Configure a state storage

{{< include "/platform-orchestrator/docs/configure/runners/runner-types/include-common-configure-state-storage.md" >}}

## Create a runner

1. Prepare the runner configuration

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
resource "platform-orchestrator_kubernetes_eks_runner" "kubernetes_eks" {
  id          = local.kubernetes_eks_runner_id
  description = "Runner of type kubernetes-eks"
  runner_configuration = {
    cluster = {
      name   = local.cluster_name
      region = local.cluster_region
      auth = {
        role_arn = aws_iam_role.runner_kubernetes_eks.arn
      }
    }
    job = {
      namespace       = kubernetes_namespace.runner_kubernetes_eks.metadata[0].name
      service_account = kubernetes_service_account.runner_kubernetes_eks.metadata[0].name
    }
  }
  state_storage_configuration = {
    # ...
  }
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

Prepare the `runner_configuration` in a local file:

```bash
cat <<EOF > runner-config.yaml
description: Runner of type kubernetes-eks
runner_configuration:
  type: kubernetes-eks
  cluster:
    name: ${CLUSTER_NAME}
    region: ${CLUSTER_REGION}
    auth:
      role_arn: arn:aws:iam::${AWS_ACCOUNT_ID}:role/${IAM_ROLE_NAME}
  job:
    namespace: ${RUNNER_K8S_NAMESPACE}
    service_account: ${RUNNER_K8S_SA}
EOF
```

{{% /tab %}}
{{< /tabs >}}

{{< include "/platform-orchestrator/docs/configure/runners/runner-types/include-common-runner-config.md" "platform-orchestrator_kubernetes_eks_runner" >}}

## Setting sensitive environment variables

{{< include "/platform-orchestrator/docs/configure/runners/runner-types/include-k8s-secret-variables.md" >}}
