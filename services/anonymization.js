"use strict";

const data_dir = require('./data_dir');
const utils = require('./utils');
const fs = require('fs-extra');
const sqlite = require('sqlite');

async function anonymize() {
    if (!fs.existsSync(data_dir.ANONYMIZED_DB_DIR)) {
        fs.mkdirSync(data_dir.ANONYMIZED_DB_DIR, 0o700);
    }

    const anonymizedFile = data_dir.ANONYMIZED_DB_DIR + "/" + "backup-" + utils.getDateTimeForFile() + ".db";

    fs.copySync(data_dir.DOCUMENT_PATH, anonymizedFile);

    const db = await sqlite.open(anonymizedFile, {Promise});

    await db.run("UPDATE notes SET note_title = 'title', note_text = 'text'");
    await db.run("UPDATE notes_history SET note_title = 'title', note_text = 'text'");
    await db.run("UPDATE notes_tree SET prefix = 'prefix' WHERE prefix IS NOT NULL");
    await db.run(`UPDATE options SET opt_value = 'anonymized' WHERE opt_name IN 
                    ('document_secret', 'encrypted_data_key', 'password_verification_hash', 
                     'password_verification_salt', 'password_derived_key_salt')`);
    await db.run("VACUUM");

    await db.close();
}

module.exports = {
    anonymize
};