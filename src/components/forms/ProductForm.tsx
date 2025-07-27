import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProductFormProps {
  produto?: any;
  onSuccess: () => void;
}

export function ProductForm({ produto, onSuccess }: ProductFormProps) {
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    tamanho: '',
    preco_venda: '',
    custo_producao: '',
    tempo_producao_min: '',
    descricao: '',
    disponibilidade: 'sob_encomenda',
    estoque_atual: '0'
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (produto) {
      setFormData({
        nome: produto.nome || '',
        tipo: produto.tipo || '',
        tamanho: produto.tamanho || '',
        preco_venda: produto.preco_venda?.toString() || '',
        custo_producao: produto.custo_producao?.toString() || '',
        tempo_producao_min: produto.tempo_producao_min?.toString() || '',
        descricao: produto.descricao || '',
        disponibilidade: produto.disponibilidade || 'sob_encomenda',
        estoque_atual: produto.estoque_atual?.toString() || '0'
      });
    }
  }, [produto]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const productData = {
        nome: data.nome,
        tipo: data.tipo,
        tamanho: data.tamanho || null,
        preco_venda: parseFloat(data.preco_venda),
        custo_producao: data.custo_producao ? parseFloat(data.custo_producao) : null,
        tempo_producao_min: data.tempo_producao_min ? parseInt(data.tempo_producao_min) : null,
        descricao: data.descricao || null,
        disponibilidade: data.disponibilidade,
        estoque_atual: parseInt(data.estoque_atual)
      };

      if (produto) {
        const { error } = await supabase
          .from('produtos')
          .update(productData)
          .eq('id', produto.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('produtos')
          .insert(productData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ 
        title: produto ? "Produto atualizado!" : "Produto criado!", 
        description: "As alterações foram salvas com sucesso." 
      });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao salvar produto", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.nome || !formData.tipo || !formData.preco_venda) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome, tipo e preço de venda são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const precoVenda = parseFloat(formData.preco_venda);
    const custoProducao = formData.custo_producao ? parseFloat(formData.custo_producao) : 0;

    if (custoProducao > 0 && precoVenda <= custoProducao) {
      toast({
        title: "Atenção",
        description: "O preço de venda é menor ou igual ao custo de produção. Verifique os valores.",
        variant: "destructive"
      });
      return;
    }

    mutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome *</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => handleInputChange('nome', e.target.value)}
            placeholder="Ex: Vela Aromática Lavanda"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo *</Label>
          <Select value={formData.tipo} onValueChange={(value) => handleInputChange('tipo', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vela">Vela</SelectItem>
              <SelectItem value="vitral">Vitral</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tamanho">Tamanho</Label>
          <Input
            id="tamanho"
            value={formData.tamanho}
            onChange={(e) => handleInputChange('tamanho', e.target.value)}
            placeholder="Ex: 15x20cm, 100g"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="preco_venda">Preço de Venda (R$) *</Label>
          <Input
            id="preco_venda"
            type="number"
            step="0.01"
            value={formData.preco_venda}
            onChange={(e) => handleInputChange('preco_venda', e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="custo_producao">Custo de Produção (R$)</Label>
          <Input
            id="custo_producao"
            type="number"
            step="0.01"
            value={formData.custo_producao}
            onChange={(e) => handleInputChange('custo_producao', e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tempo_producao_min">Tempo de Produção (min)</Label>
          <Input
            id="tempo_producao_min"
            type="number"
            value={formData.tempo_producao_min}
            onChange={(e) => handleInputChange('tempo_producao_min', e.target.value)}
            placeholder="60"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="disponibilidade">Disponibilidade</Label>
          <Select value={formData.disponibilidade} onValueChange={(value) => handleInputChange('disponibilidade', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pronta_entrega">Pronta Entrega</SelectItem>
              <SelectItem value="sob_encomenda">Sob Encomenda</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="estoque_atual">Estoque Atual</Label>
          <Input
            id="estoque_atual"
            type="number"
            value={formData.estoque_atual}
            onChange={(e) => handleInputChange('estoque_atual', e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) => handleInputChange('descricao', e.target.value)}
          placeholder="Descrição detalhada do produto..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Salvando...' : produto ? 'Atualizar' : 'Criar Produto'}
        </Button>
      </div>
    </form>
  );
}