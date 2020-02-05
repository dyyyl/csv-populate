#!/usr/bin/env node
// 👆 Used to tell Node.js that this is a CLI too
const commander = require("commander");
const fs = require("fs");

const program = new commander.Command();

program
  .name("populate")
  .version("0.1.0")
  .description(`Populate directories with data from CSV`)
  .option("-o, --out-dir [outDir]", "output directory for mocked data", ".")
  .option("-r, --row [row]", "row to begin parsing", 1)
  .requiredOption("-p, --path [path]", "path to csv to be parsed")
  .parse(process.argv);

const { outDir, path, row } = program;

// 1. Access file
const parseFile = (path, row) => {
  try {
    const fileArray = fs
      .readFileSync(path, "utf-8")
      .toString()
      .split("\n");

    const file = fileArray.filter((_, index) => {
      return index + 1 >= row;
    });

    return file;
  } catch (error) {
    return error;
  }
};

const file = parseFile(path, row);

// 2. Yeet dir names from csv
const sanitizeFile = file => {
  return file.map(fileRow =>
    fileRow
      .split(",")
      .filter(row => row !== "")
      .map(row => row.replace(/\r?\n|\r/g, ""))
      .map(row => row.replace(/\s/g, "-"))
  );
};

const sanitizedFile = sanitizeFile(file);

const makeDirectoryNames = file =>
  file.map(row => `/${row[0]}_${row[1]}_${row[2]}/`);

const yeetLastElement = array => array.pop();

const directoryArray = makeDirectoryNames(sanitizedFile);

yeetLastElement(directoryArray);

// 3. forEach name, generate directory in outDir
const createDirectory = directoryPath => {
  fs.mkdirSync(process.cwd() + directoryPath, { recursive: true }, error => {
    if (error) console.log(`An error occured: ${error} 😭`);
    else console.log("Your directories have been created! 🚀");
  });
};

directoryArray.forEach(createDirectory);
