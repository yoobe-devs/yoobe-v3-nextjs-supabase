-- Auditoria de cadastro/convite/remoção de usuários

CREATE TABLE IF NOT EXISTS public.user_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NULL,
  target_user_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('invite','create','update','delete')),
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_audit_logs ENABLE ROW LEVEL SECURITY;

-- Visualização por admin e pelo próprio ator/usuário alvo
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_audit_logs' AND policyname = 'audit_select_admin_or_related'
  ) THEN
    EXECUTE 'CREATE POLICY "audit_select_admin_or_related" ON public.user_audit_logs FOR SELECT USING ((auth.role() = ''authenticated'' AND ((EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = ''admin'')) OR (actor_id = auth.uid()) OR (target_user_id = auth.uid()))))';
  END IF;
END $$;

-- Funções de log
CREATE OR REPLACE FUNCTION public.log_user_invite(p_actor uuid, p_target uuid, p_details jsonb)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_audit_logs(actor_id, target_user_id, action, details)
  VALUES (p_actor, p_target, 'invite', COALESCE(p_details, '{}'::jsonb));
END;$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.log_user_create(p_actor uuid, p_target uuid, p_details jsonb)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_audit_logs(actor_id, target_user_id, action, details)
  VALUES (p_actor, p_target, 'create', COALESCE(p_details, '{}'::jsonb));
END;$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.log_user_update(p_actor uuid, p_target uuid, p_details jsonb)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_audit_logs(actor_id, target_user_id, action, details)
  VALUES (p_actor, p_target, 'update', COALESCE(p_details, '{}'::jsonb));
END;$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.log_user_delete(p_actor uuid, p_target uuid, p_details jsonb)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_audit_logs(actor_id, target_user_id, action, details)
  VALUES (p_actor, p_target, 'delete', COALESCE(p_details, '{}'::jsonb));
END;$$ LANGUAGE plpgsql SECURITY DEFINER;


