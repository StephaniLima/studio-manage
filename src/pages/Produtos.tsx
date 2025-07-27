import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/layout/Layout";
import { Plus, Edit, Trash2, Copy } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductForm } from "@/components/forms/ProductForm";

export default function Produtos() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: produtos, isLoading } = useQuery({
    queryKey: ['produtos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Produto excluído com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
    },
    onError: () => {
      toast({ 
        title: "Erro ao excluir produto", 
        variant: "destructive" 
      });
    }
  });

  const duplicateMutation = useMutation({
    mutationFn: async (produto: any) => {
      const { nome, tipo, tamanho, preco_venda, custo_producao, tempo_producao_min, descricao, disponibilidade } = produto;
      const { error } = await supabase
        .from('produtos')
        .insert({
          nome: `${nome} (Cópia)`,
          tipo,
          tamanho,
          preco_venda,
          custo_producao,
          tempo_producao_min,
          descricao,
          disponibilidade,
          estoque_atual: 0
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Produto duplicado com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
    },
    onError: () => {
      toast({ 
        title: "Erro ao duplicar produto", 
        variant: "destructive" 
      });
    }
  });

  const handleEdit = (produto: any) => {
    setEditingProduct(produto);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleDuplicate = (produto: any) => {
    duplicateMutation.mutate(produto);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  const getTipoColor = (tipo: string) => {
    return tipo === 'vela' ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800';
  };

  const getDisponibilidadeColor = (disponibilidade: string) => {
    return disponibilidade === 'pronta_entrega' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Carregando produtos...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Produtos</h1>
            <p className="text-muted-foreground mt-1">Gerencie seu catálogo de produtos</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => setEditingProduct(null)}>
                <Plus className="h-4 w-4" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </DialogTitle>
              </DialogHeader>
              <ProductForm 
                produto={editingProduct} 
                onSuccess={closeDialog}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Products Table */}
        <Card>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Disponibilidade</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtos?.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell className="font-medium">{produto.nome}</TableCell>
                    <TableCell>
                      <Badge className={getTipoColor(produto.tipo)}>
                        {produto.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>{produto.tamanho || '-'}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(produto.preco_venda)}
                    </TableCell>
                    <TableCell>{produto.estoque_atual}</TableCell>
                    <TableCell>
                      <Badge className={getDisponibilidadeColor(produto.disponibilidade)}>
                        {produto.disponibilidade === 'pronta_entrega' ? 'Pronta Entrega' : 'Sob Encomenda'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(produto)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDuplicate(produto)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(produto.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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