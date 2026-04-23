# Remove all internal or technical paths
def remove_internal_paths:
  .paths |= with_entries(select(.key | startswith("/internal") or startswith("/.well-known") | not));

# Remove all operations with a tag of "internal"
def remove_internal_operations:
  .paths |= with_entries(
    .value |= with_entries(
      select(.value.tags | index("internal") | not)
    )
  );

def remove_empty_paths:
  .paths |= with_entries(
    select(.value != {})
  );

remove_internal_paths | remove_internal_operations | remove_empty_paths
