import * as Knex from "knex";

// Finishes what 20250123223740_search_index meant to do. That migration was
// one multi-statement knex.raw(), and the sqlite3 driver runs only the first
// statement of a string, so all it did was create the skin_search table: it
// never populated it or created the triggers that keep it current. Production's
// index was filled by hand once, and has missed every skin added since.
//
// Each statement here is its own knex.raw() for that reason. The triggers are
// dropped first so this can be rerun safely.

const TRIGGERS = {
  after_skin_insert: `
    CREATE TRIGGER after_skin_insert AFTER INSERT ON skins
    BEGIN
      INSERT INTO skin_search(skin_md5, readme_text, file_names)
      VALUES (
        NEW.md5,
        NEW.readme_text,
        (SELECT GROUP_CONCAT(file_path, ' ') FROM files WHERE skin_md5 = NEW.md5)
      );
    END`,
  after_skin_update: `
    CREATE TRIGGER after_skin_update AFTER UPDATE OF readme_text ON skins
    BEGIN
      UPDATE skin_search SET readme_text = NEW.readme_text
      WHERE skin_md5 = NEW.md5;
    END`,
  after_skin_delete: `
    CREATE TRIGGER after_skin_delete AFTER DELETE ON skins
    BEGIN
      DELETE FROM skin_search WHERE skin_md5 = OLD.md5;
    END`,
  after_file_insert: `
    CREATE TRIGGER after_file_insert AFTER INSERT ON files
    BEGIN
      UPDATE skin_search
      SET file_names = (
        SELECT GROUP_CONCAT(file_path, ' ') FROM files WHERE skin_md5 = NEW.skin_md5
      )
      WHERE skin_md5 = NEW.skin_md5;
    END`,
  after_file_update: `
    CREATE TRIGGER after_file_update AFTER UPDATE OF file_path ON files
    BEGIN
      UPDATE skin_search
      SET file_names = (
        SELECT GROUP_CONCAT(file_path, ' ') FROM files WHERE skin_md5 = NEW.skin_md5
      )
      WHERE skin_md5 = NEW.skin_md5;
    END`,
  after_file_delete: `
    CREATE TRIGGER after_file_delete AFTER DELETE ON files
    BEGIN
      UPDATE skin_search
      SET file_names = (
        SELECT GROUP_CONCAT(file_path, ' ') FROM files WHERE skin_md5 = OLD.skin_md5
      )
      WHERE skin_md5 = OLD.skin_md5;
    END`,
};

export async function up(knex: Knex): Promise<void> {
  for (const [name, sql] of Object.entries(TRIGGERS)) {
    await knex.raw(`DROP TRIGGER IF EXISTS ${name}`);
    await knex.raw(sql);
  }

  // Skins added since the index was filled.
  await knex.raw(`
    INSERT INTO skin_search(skin_md5, readme_text, file_names)
    SELECT s.md5, s.readme_text, GROUP_CONCAT(f.file_path, ' ')
    FROM skins s
    LEFT JOIN files f ON f.skin_md5 = s.md5
    WHERE s.md5 NOT IN (SELECT skin_md5 FROM skin_search)
    GROUP BY s.md5`);

  // Skins deleted since.
  await knex.raw(`
    DELETE FROM skin_search WHERE skin_md5 NOT IN (SELECT md5 FROM skins)`);
}

export async function down(knex: Knex): Promise<void> {
  for (const name of Object.keys(TRIGGERS)) {
    await knex.raw(`DROP TRIGGER IF EXISTS ${name}`);
  }
}
