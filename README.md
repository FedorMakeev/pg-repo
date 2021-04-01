**pg-repo**

This is a simple module for Postgress, that takes care about:
 1. connection management (single server or cluster)
 2. SQL execution
 3. data selection
 4. DDL support (table columns, indices and constraints)

Set environment variable POSTGRESS_CLUSTER=host-1:port-1,host-2:port-2,host-3:port-3 for cluster support

Set environment variable PG_REPO_DEBUG = true to see debug messages

Set environment variable PG_REPO_POOL_CHECK_INTERVAL (min value - 1000) in ms for refreshing servers roles in cluster