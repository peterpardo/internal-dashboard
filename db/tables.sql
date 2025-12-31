CREATE TABLE tenants (
    id UUID PRIMARY KEY gen_random_uuid(),

    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,

    status TEXT NOT NULL CHECK (status IN ('active', 'suspended')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tenant_id UUID NOT NULL,

    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,

    first_name TEXT,
    last_name TEXT,

    status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'locked')),

    last_login_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT users_tenant_email_unique UNIQUE (tenant_id, email),
    CONSTRAINT users_tenant_fk FOREIGN KEY (tenant_id) ON DELETE CASCADE
);

-- CREATE TABLE tenant_users (
--     tenant_id UUID NOT NULL,
--     user_id UUID NOT NULL,

--     -- example metadata
--     is_owner BOOLEAN NOT NULL DEFAULT false,

--     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

--     PRIMARY KEY (tenant_id, user_id),

--     CONSTRAINT fk_tenant 
--         FOREIGN KEY (tenant_id)
--         REFERENCES tenant (id)
--         ON DELETE CASCADE,

--     CONSTRAINT fk_user
--         FOREIGN KEY (user_id)
--         REFERENCES user (id)
--         ON DELETE CASCADE
-- );

-- CREATE INDEX idx_tenant_users_user_id 
--     ON tenant_users (user_id);

-- CREATE INDEX idx_tenant_users_tenant_id
--     ON tenant_users (tenant_id);

