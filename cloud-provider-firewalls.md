# Configure Cloud Provider Firewall for Exposed Services

Agnost requires you to open ports in the range of 64000-65000 for exposing TCP services to the internet or your on-prem network.

## GCP (GKE Clusters)

You can check out the documentation on [GCP docs](https://cloud.google.com/firewall/docs/use-network-firewall-policies#create-rules)

## AWS (EKS Clusters)

You need to check the documentation for [Security Groups](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html)

## Azure (AKS Clusters)

You can follow the documentation on Microsoft [learn site](https://learn.microsoft.com/en-us/azure/firewall/protect-azure-kubernetes-service)

## Digital Ocean (DOKS Clusters)

You need to configure the firewall created during the DOKS clusters installation, as described [here](https://docs.digitalocean.com/products/networking/firewalls/how-to/configure-rules/)

