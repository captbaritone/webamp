import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
        -- Step 1: Create the FTS table
CREATE VIRTUAL TABLE skin_search USING fts5(
    skin_md5,
    readme_text,
    file_names
);

-- Step 2: Populate the FTS table with existing data
INSERT INTO skin_search(skin_md5, readme_text, file_names)
SELECT
    s.md5,
    s.readme_text,
    GROUP_CONCAT(f.file_path, ' ')
FROM
    skins s
LEFT JOIN
    files f ON s.md5 = f.skin_md5
GROUP BY
    s.md5;

-- Step 3: Create triggers to keep the FTS index updated

-- Trigger for inserting into the skins table
CREATE TRIGGER after_skin_insert AFTER INSERT ON skins
BEGIN
    INSERT INTO skin_search(skin_md5, readme_text)
    VALUES (NEW.md5, NEW.readme_text);
END;

-- Trigger for updating skins readme_text
CREATE TRIGGER after_skin_update AFTER UPDATE OF readme_text ON skins
BEGIN
    UPDATE skin_search
    SET readme_text = NEW.readme_text
    WHERE skin_md5 = NEW.md5;
END;

-- Trigger for inserting into the files table
CREATE TRIGGER after_file_insert AFTER INSERT ON files
BEGIN
    UPDATE skin_search
    SET file_names = (
        SELECT GROUP_CONCAT(file_path, ' ')
        FROM files
        WHERE skin_md5 = NEW.skin_md5
    )
    WHERE skin_md5 = NEW.skin_md5;
END;

-- Trigger for updating file_path in files
CREATE TRIGGER after_file_update AFTER UPDATE OF file_path ON files
BEGIN
    UPDATE skin_search
    SET file_names = (
        SELECT GROUP_CONCAT(file_path, ' ')
        FROM files
        WHERE skin_md5 = NEW.skin_md5
    )
    WHERE skin_md5 = NEW.skin_md5;
END;

-- Trigger for deleting files
CREATE TRIGGER after_file_delete AFTER DELETE ON files
BEGIN
    UPDATE skin_search
    SET file_names = (
        SELECT GROUP_CONCAT(file_path, ' ')
        FROM files
        WHERE skin_md5 = OLD.skin_md5
    )
    WHERE skin_md5 = OLD.skin_md5;
END;`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        DROP TRIGGER after_skin_insert;
        DROP TRIGGER after_skin_update;
        DROP TRIGGER after_file_insert;
        DROP TRIGGER after_file_update;
        DROP TRIGGER after_file_delete;
        DROP TABLE skin_search;
    `);
}
