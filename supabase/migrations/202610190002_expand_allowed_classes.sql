-- Expand the seeded event class list without changing the applied baseline migration.
-- Existing participants are preserved; only the event configuration is updated.
update public.events
set allowed_classes = array['IXA', 'IXB', 'IXC', 'IXD', 'IXE', 'IXF', 'IXG', 'IXH']
where id = 'e0000000-0000-0000-0000-000000000001';
