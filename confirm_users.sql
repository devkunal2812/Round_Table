-- Confirm all unconfirmed users so they can log in immediately
UPDATE auth.users
SET email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Verify
SELECT email, email_confirmed_at, created_at
FROM auth.users
ORDER BY created_at DESC;
