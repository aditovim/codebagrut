/*
# Fix: revoke PUBLIC execute on register_teacher

The initial migration revoked EXECUTE from anon, but Postgres functions
default to PUBLIC execute, and anon inherits from PUBLIC. This removes
the public grant so only authenticated can call it.
*/

REVOKE EXECUTE ON FUNCTION register_teacher FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION register_teacher FROM anon;
GRANT EXECUTE ON FUNCTION register_teacher TO authenticated;
