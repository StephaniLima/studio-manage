import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, AlertTriangle, Plus } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Dashboard() {
  // Fetch dashboard data
  const { data: produtos } = useQuery({
    queryKey: ['produtos-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produtos')
        .select('estoque_atual')
        .gt('estoque_atual', 0);
      if (error) throw error;
      return data?.reduce((sum, p) => sum + p.estoque_atual, 0) || 0;
    }
  });

  const { data: pedidosEmProducao } = useQuery({
    queryKey: ['pedidos-em-producao'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('status', 'em_producao');
      if (error) throw error;
      return data?.length || 0;
    }
  });

  const { data: materiaisAlert } = useQuery({
    queryKey: ['materiais-alert'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('materiais')
        .select('*')
        .filter('quantidade_disponivel', 'lt', 'limite_minimo');
      if (error) throw error;
      return data?.length || 0;
    }
  });

  const { data: ultimosPedidos } = useQuery({
    queryKey: ['ultimos-pedidos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          pedido_itens (
            quantidade,
            produto_id,
            produtos (nome)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'em_producao': return 'bg-yellow-100 text-yellow-800';
      case 'pronto': return 'bg-green-100 text-green-800';
      case 'entregue': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'em_producao': return 'Em Produção';
      case 'pronto': return 'Pronto';
      case 'entregue': return 'Entregue';
      default: return status;
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Visão geral do seu negócio</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Pedido
          </Button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estoque Disponível</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{produtos || 0}</div>
              <p className="text-xs text-muted-foreground">produtos em estoque</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos em Produção</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pedidosEmProducao || 0}</div>
              <p className="text-xs text-muted-foreground">aguardando finalização</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas de Material</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{materiaisAlert || 0}</div>
              <p className="text-xs text-muted-foreground">materiais em baixa</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Últimos Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Produtos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ultimosPedidos?.map((pedido) => (
                  <TableRow key={pedido.id}>
                    <TableCell>
                      {pedido.cliente_nome || 'Cliente não informado'}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {pedido.pedido_itens?.map((item: any, index: number) => (
                          <div key={index} className="text-sm">
                            {item.quantidade}x {item.produtos?.nome}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(pedido.status)}>
                        {formatStatus(pedido.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(pedido.valor_total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}