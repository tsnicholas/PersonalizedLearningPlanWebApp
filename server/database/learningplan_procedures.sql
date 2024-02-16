CREATE OR REPLACE PROCEDURE update_is_complete()
AS $$
    BEGIN
        UPDATE GOAL
        SET is_complete = (CURRENT_TIMESTAMP < expiration)
        WHERE expiration IS NOT NULL;
    END;
$$ LANGUAGE PLPGSQL;

CREATE OR REPLACE PROCEDURE update_module_completion()
AS $$
    DECLARE row RECORD;
    DECLARE num_of_goals DECIMAL;
    DECLARE num_of_completed_goals DECIMAL;

    BEGIN
        FOR row IN SELECT * FROM MODULE LOOP
            SELECT COUNT(*) FROM GOAL INTO num_of_goals WHERE module_id = row.module_id;
            SELECT COUNT(*) FROM GOAL INTO num_of_completed_goals WHERE module_id = row.module_id AND is_complete IS TRUE;

            IF num_of_goals > 0 THEN
                UPDATE MODULE m
                SET completion_percent = num_of_completed_goals / num_of_goals * 100
                WHERE m.module_id = row.module_id;
            ELSE
                UPDATE MODULE m
                SET completion_percent = 100
                WHERE m.module_id = row.id;
            END IF;
        END LOOP;
    END;
$$ LANGUAGE PLPGSQL;

-- Checks to see if the goal's completion has expired before returning the data.
-- You must use this function to parse a goal otherwise it might be inaccurate.
CREATE OR REPLACE FUNCTION get_goal(id INT)
RETURNS GOAL AS $$
    CALL update_is_complete(id);

    SELECT * FROM GOAL g
    WHERE g.goal_id = get_goal.id;
$$ LANGUAGE SQL SECURITY definer;

CREATE OR REPLACE FUNCTION get_goals(id INT)
RETURNS SETOF GOAL AS $$    
    BEGIN
        UPDATE GOAL g
        SET is_complete = CURRENT_TIMESTAMP < g.expiration
        WHERE g.expiration IS NOT NULL;
        CALL update_module_completion(get_goals.id, 'false', 'false');

        RETURN QUERY SELECT * FROM GOAL g WHERE g.module_id = get_goals.id;
    END;
$$ LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION calc_completion_percent()
RETURNS TRIGGER AS $$
    DECLARE id INT;
    
    BEGIN
        IF (TG_OP = 'DELETE') THEN
            id := OLD.module_id;
            CALL update_module_completion(id, 'true', OLD.is_complete);
        ELSE
            id := NEW.module_id;
            CALL update_module_completion(id, 'false', 'false');
        END IF;
        
        RETURN NEW;
    END;
$$ LANGUAGE PLPGSQL;

CREATE OR REPLACE TRIGGER trigger_calc_completion_percent
AFTER INSERT OR UPDATE OF is_complete OR DELETE ON GOAL
FOR EACH ROW
EXECUTE FUNCTION calc_completion_percent();