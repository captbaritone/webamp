import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TABLE museum_sort_overrides (
        id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
        skin_md5 TEXT NOT NULL UNIQUE,
        comment TEXT,
        score INTEGER NOT NULL,
        FOREIGN KEY (skin_md5) REFERENCES skins (md5) ON DELETE CASCADE ON UPDATE NO ACTION
    );`);

  await knex.raw(`INSERT INTO
        museum_sort_overrides (skin_md5, comment, score)
    VALUES
        ("5e4f10275dcb1fb211d4a8b4f1bda236", "Base", 5),
        ("cd251187a5e6ff54ce938d26f1f2de02", "Winamp3 Classified", 4),
        ("b0fb83cc20af3abe264291bb17fb2a13", "Winamp5 Classified", 3),
        ("d6010aa35bed659bc1311820daa4b341", "Bento Classified", 2),
        ("d7541f8c5be768cf23b9aeee1d6e70c7", "Duplicate Garfield", -1),
        ("25a932542e307416ca86da4e16be1b32", "Duplicate Vault-tec", -1),
        ("89643da06361e4bcc269fe811f07c4a3", "Duplicate Vault-tec", -1),
        ("fb1ca386260ee4d4e44b7a3a2e029729", "Duplicate Vault-tec", -1),
        ("db1f2e128f6dd6c702b7a448751fbe84", "Duplicate Fallout", -1),
        ("be2de111c4710af306fea0813440f275", "Duplicate Microchip", -1),
        ("66cf0af3593d79fc8a5080dd17f8b07d", "Duplicate Microchip", -1),
        ("4269b10d8d27bd201f8608c59295680c", "Duplicate Doom", -1),
        ("44c8f2bf4889f7ea5565e82f332f4a20", "Duplicate Mtn Dew", -1);
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE museum_sort_overrides;`);
}
