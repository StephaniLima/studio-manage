export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      materiais: {
        Row: {
          created_at: string
          custo_unitario: number | null
          id: string
          limite_minimo: number
          nome_material: string
          quantidade_disponivel: number
          unidade: Database["public"]["Enums"]["material_unidade"]
        }
        Insert: {
          created_at?: string
          custo_unitario?: number | null
          id?: string
          limite_minimo?: number
          nome_material: string
          quantidade_disponivel?: number
          unidade: Database["public"]["Enums"]["material_unidade"]
        }
        Update: {
          created_at?: string
          custo_unitario?: number | null
          id?: string
          limite_minimo?: number
          nome_material?: string
          quantidade_disponivel?: number
          unidade?: Database["public"]["Enums"]["material_unidade"]
        }
        Relationships: []
      }
      pedido_itens: {
        Row: {
          id: string
          pedido_id: string
          preco_unitario: number
          produto_id: string
          quantidade: number
        }
        Insert: {
          id?: string
          pedido_id: string
          preco_unitario: number
          produto_id: string
          quantidade: number
        }
        Update: {
          id?: string
          pedido_id?: string
          preco_unitario?: number
          produto_id?: string
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedido_itens_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          cliente_nome: string | null
          created_at: string
          data_pedido: string
          id: string
          observacoes: string | null
          status: Database["public"]["Enums"]["pedido_status"]
          valor_total: number
        }
        Insert: {
          cliente_nome?: string | null
          created_at?: string
          data_pedido?: string
          id?: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["pedido_status"]
          valor_total?: number
        }
        Update: {
          cliente_nome?: string | null
          created_at?: string
          data_pedido?: string
          id?: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["pedido_status"]
          valor_total?: number
        }
        Relationships: []
      }
      produto_materiais: {
        Row: {
          id: string
          material_id: string
          produto_id: string
          quantidade_consumida: number
        }
        Insert: {
          id?: string
          material_id: string
          produto_id: string
          quantidade_consumida: number
        }
        Update: {
          id?: string
          material_id?: string
          produto_id?: string
          quantidade_consumida?: number
        }
        Relationships: [
          {
            foreignKeyName: "produto_materiais_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produto_materiais_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          created_at: string
          custo_producao: number | null
          descricao: string | null
          disponibilidade: Database["public"]["Enums"]["produto_disponibilidade"]
          estoque_atual: number
          id: string
          imagem_url: string | null
          nome: string
          preco_venda: number
          tamanho: string | null
          tempo_producao_min: number | null
          tipo: Database["public"]["Enums"]["produto_tipo"]
        }
        Insert: {
          created_at?: string
          custo_producao?: number | null
          descricao?: string | null
          disponibilidade?: Database["public"]["Enums"]["produto_disponibilidade"]
          estoque_atual?: number
          id?: string
          imagem_url?: string | null
          nome: string
          preco_venda: number
          tamanho?: string | null
          tempo_producao_min?: number | null
          tipo: Database["public"]["Enums"]["produto_tipo"]
        }
        Update: {
          created_at?: string
          custo_producao?: number | null
          descricao?: string | null
          disponibilidade?: Database["public"]["Enums"]["produto_disponibilidade"]
          estoque_atual?: number
          id?: string
          imagem_url?: string | null
          nome?: string
          preco_venda?: number
          tamanho?: string | null
          tempo_producao_min?: number | null
          tipo?: Database["public"]["Enums"]["produto_tipo"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      material_unidade: "g" | "ml" | "m" | "un"
      pedido_status: "em_producao" | "pronto" | "entregue"
      produto_disponibilidade: "pronta_entrega" | "sob_encomenda"
      produto_tipo: "vela" | "vitral"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      material_unidade: ["g", "ml", "m", "un"],
      pedido_status: ["em_producao", "pronto", "entregue"],
      produto_disponibilidade: ["pronta_entrega", "sob_encomenda"],
      produto_tipo: ["vela", "vitral"],
    },
  },
} as const
