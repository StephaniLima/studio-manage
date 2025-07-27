-- Create enums
CREATE TYPE public.produto_tipo AS ENUM ('vela', 'vitral');
CREATE TYPE public.produto_disponibilidade AS ENUM ('pronta_entrega', 'sob_encomenda');
CREATE TYPE public.pedido_status AS ENUM ('em_producao', 'pronto', 'entregue');
CREATE TYPE public.material_unidade AS ENUM ('g', 'ml', 'm', 'un');

-- Create produtos table
CREATE TABLE public.produtos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR NOT NULL,
    tipo produto_tipo NOT NULL,
    tamanho VARCHAR,
    preco_venda DECIMAL(10,2) NOT NULL,
    custo_producao DECIMAL(10,2),
    tempo_producao_min INTEGER,
    descricao TEXT,
    imagem_url VARCHAR,
    disponibilidade produto_disponibilidade NOT NULL DEFAULT 'sob_encomenda',
    estoque_atual INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pedidos table
CREATE TABLE public.pedidos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_nome VARCHAR,
    status pedido_status NOT NULL DEFAULT 'em_producao',
    valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    data_pedido TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pedido_itens table
CREATE TABLE public.pedido_itens (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
    produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
    quantidade INTEGER NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL
);

-- Create materiais table
CREATE TABLE public.materiais (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_material VARCHAR NOT NULL,
    unidade material_unidade NOT NULL,
    quantidade_disponivel DECIMAL(10,3) NOT NULL DEFAULT 0,
    limite_minimo DECIMAL(10,3) NOT NULL DEFAULT 0,
    custo_unitario DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create produto_materiais table
CREATE TABLE public.produto_materiais (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES public.materiais(id) ON DELETE CASCADE,
    quantidade_consumida DECIMAL(10,3) NOT NULL,
    UNIQUE(produto_id, material_id)
);

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Create storage policies for product images
CREATE POLICY "Anyone can view product images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Anyone can upload product images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Anyone can update product images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'product-images');

CREATE POLICY "Anyone can delete product images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'product-images');

-- Enable Row Level Security (but make tables public for this business app)
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produto_materiais ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (since this is a business management app)
CREATE POLICY "Anyone can manage produtos" ON public.produtos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can manage pedidos" ON public.pedidos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can manage pedido_itens" ON public.pedido_itens FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can manage materiais" ON public.materiais FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can manage produto_materiais" ON public.produto_materiais FOR ALL USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add indexes for better performance
CREATE INDEX idx_produtos_tipo ON public.produtos(tipo);
CREATE INDEX idx_produtos_disponibilidade ON public.produtos(disponibilidade);
CREATE INDEX idx_pedidos_status ON public.pedidos(status);
CREATE INDEX idx_pedidos_data_pedido ON public.pedidos(data_pedido);
CREATE INDEX idx_pedido_itens_pedido_id ON public.pedido_itens(pedido_id);
CREATE INDEX idx_pedido_itens_produto_id ON public.pedido_itens(produto_id);
CREATE INDEX idx_materiais_quantidade_limite ON public.materiais(quantidade_disponivel, limite_minimo);
CREATE INDEX idx_produto_materiais_produto_id ON public.produto_materiais(produto_id);
CREATE INDEX idx_produto_materiais_material_id ON public.produto_materiais(material_id);