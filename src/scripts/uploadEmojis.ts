import { APIUser, REST } from "discord.js";
import fs from "fs";
import path from "path";
import validateEnv from "@/utils/validateEnv";
import { RESTGetAPIApplicationEmojisResult, Routes } from "discord-api-types/v10";
import chalk from "chalk";
import { readFile } from "fs/promises";

if (!validateEnv()) process.exit(1);

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

const mimeTypes = {
  png: "image/png",
  jpg: "image/jpeg",
  gif: "image/gif",
};

type EmojiData = {
  name: string;
  mimeType: string;
  path: string;
};

const localEmojis = new Map<string, EmojiData>();

function getLocalEmojis(dir: string, depth = 0) {
  const files = fs.readdirSync(dir);
  const folders = files.filter((file) => fs.statSync(path.join(dir, file)).isDirectory()).toSorted();

  folders.forEach((folder, idx) => {
    const folderPath = path.join(dir, folder);
    const emojiFiles = fs.readdirSync(folderPath);

    let countInFolder = 0;

    for (const emojiFile of emojiFiles) {
      const stats = fs.statSync(path.join(folderPath, emojiFile));
      if (stats.isDirectory()) continue;

      const emojiFileSplit = emojiFile.split(".");

      const name = emojiFileSplit.slice(0, emojiFileSplit.length - 1).join(".");
      const extension = emojiFileSplit[emojiFileSplit.length - 1] as keyof typeof mimeTypes;

      if (!mimeTypes[extension]) {
        console.log(chalk.red("[Error] ") + `Invalid file type: ${emojiFile}, must be one of: png, jpg, gif`);
        continue;
      }

      countInFolder++;
      localEmojis.set(name, { name, mimeType: mimeTypes[extension], path: path.join(folderPath, emojiFile) });
    }

    // uzzīmē man kociņu
    console.log(
      `${"  ".repeat(depth > 0 ? depth - 1 : 0)}${depth > 0 ? (idx === folders.length - 1 ? "└╴" : "├╴") : ""}${folder} (${countInFolder})`,
    );

    getLocalEmojis(folderPath, depth + 1);
  });
}

async function getUploadedEmojis(botId: string) {
  const emojis = (await rest.get(Routes.applicationEmojis(botId))) as RESTGetAPIApplicationEmojisResult;
  return new Set<string>(emojis.items.map((emoji) => emoji.name!));
}

async function uploadEmojis(botId: string, uploadSet: Set<string>) {
  const promises: Promise<any>[] = [];

  let uploadedCount = 0;

  const errors: any[] = [];

  for (const name of uploadSet) {
    promises.push(
      readFile(localEmojis.get(name)!.path, "base64")
        .then((b64) =>
          rest.post(Routes.applicationEmojis(botId), {
            body: { name, image: `data:${localEmojis.get(name)!.mimeType};base64,${b64}` },
          }),
        )
        .then(() => uploadedCount++)
        .catch((e) => errors.push(e))
        .finally(() => {
          process.stdout.clearLine(0);
          process.stdout.write(
            `${chalk.blue(`\r[${uploadedCount}/${uploadSet.size}]`)} Uploaded "${name}" ${errors.length ? `(errors: ${errors.length})` : ""}`,
          );
        }),
    );

    await Promise.all(promises);

    if (errors.length) {
      for (const e of errors) {
        console.error(e);
      }
    }
  }
}

const bot = (await rest.get(Routes.user("@me"))) as APIUser;
const botId = bot!.id;

const emojisPath = path.join(__dirname, "../assets/emoji");

getLocalEmojis(emojisPath);
const uploadedEmojis = await getUploadedEmojis(botId);

console.log(`\nLocal emoji count: ${localEmojis.size}`);
console.log(`Uploaded emoji count: ${uploadedEmojis.size}`);

const diff = new Set([...localEmojis.keys()].filter((emoji) => !uploadedEmojis.has(emoji)));

if (diff.size === 0) {
  console.log(chalk.green("Nothing to upload"));
} else {
  console.log(`Uploading ${diff.size} emojis...`);
  await uploadEmojis(botId, diff);
  console.log("\n" + chalk.green("Done!"));
}
