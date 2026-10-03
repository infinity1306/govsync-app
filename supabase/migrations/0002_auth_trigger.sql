-- Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
    dept_uuid UUID := NULL;
    assigned_role user_role;
    dept_slug TEXT;
BEGIN
    -- Extract role from metadata, default to 'contractor' if missing
    assigned_role := COALESCE((new.raw_user_meta_data->>'role')::user_role, 'contractor'::user_role);
    dept_slug := new.raw_user_meta_data->>'dept_slug';

    -- Lookup department ID if a slug was provided
    IF dept_slug IS NOT NULL THEN
        SELECT id INTO dept_uuid FROM public.departments WHERE slug = dept_slug LIMIT 1;
    END IF;

    -- Insert the profile
    INSERT INTO public.profiles (id, role, department_id, full_name)
    VALUES (
        new.id,
        assigned_role,
        dept_uuid,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
    );

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
