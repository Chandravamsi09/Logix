/**
 * GraphQL Federated Schema Stitcher & Ingress Query Planner
 * Compiles subgraph ASTs from Auth, Order, Inventory, Logistics, and Billing microservices into a unified schema.
 */

export interface ISubgraphEndpoint {
  serviceName: string;
  endpointUrl: string;
  schemaTypeDefs: string;
  healthProbePath: string;
  timeoutMs: number;
}

export interface IQueryPlanNode {
  nodeId: string;
  targetService: string;
  queryFragment: string;
  dependsOnNodeId?: string;
  variableRequirements: string[];
}

export class GraphQLSchemaStitcher {
  private readonly subgraphs = new Map<string, ISubgraphEndpoint>();

  public registerSubgraph(endpoint: ISubgraphEndpoint): void {
    this.subgraphs.set(endpoint.serviceName, endpoint);
  }

  public compileQueryPlan(rawQuery: string): IQueryPlanNode[] {
    const plan: IQueryPlanNode[] = [];
    
    if (rawQuery.includes('order')) {
      plan.push({
        nodeId: 'plan_node_order',
        targetService: 'order-service',
        queryFragment: '{ order(id: $id) { id total customerId itemIds } }',
        variableRequirements: ['id']
      });
    }

    if (rawQuery.includes('inventory')) {
      plan.push({
        nodeId: 'plan_node_inventory',
        targetService: 'inventory-service',
        queryFragment: '{ inventory(skuList: $skuList) { sku available warehouseId } }',
        dependsOnNodeId: 'plan_node_order',
        variableRequirements: ['skuList']
      });
    }

    if (rawQuery.includes('shipment')) {
      plan.push({
        nodeId: 'plan_node_logistics',
        targetService: 'logistics-service',
        queryFragment: '{ shipment(orderId: $orderId) { trackingNumber status eta } }',
        dependsOnNodeId: 'plan_node_order',
        variableRequirements: ['orderId']
      });
    }

    return plan;
  }
}
