// This module is imported early here in order to avoid a circular dependency.
import { classResolver } from "./skin/resolver";
import { normalizedObjects, getFormattedId } from "./maki/objects";
import BaseObject from "./skin/makiClasses/BaseObject";

function hack() {
  // Without this Snowpack will try to treeshake out resolver causing a circular
  // dependency.
  classResolver("A funny joke about why this is needed.");
}

/*
async function validateSkinMaki(file: Blob) {
  const zip = await JSZip.loadAsync(file);
  const maki = zip.filter((path) => path.endsWith(".maki"));
  for (const zipFile of maki) {
    console.log(zipFile.name);
    const arraybuffer = await zip.loadAsync("arraybuffer");
    console.log(arraybuffer);
  }
}

addDropHandler(validateSkinMaki);
*/

function getClass(guid: string): typeof BaseObject | null {
  try {
    return classResolver(guid);
  } catch (e) {
    return null;
  }
}

const totals = document.createElement("div");
document.body.appendChild(totals);
const table = document.createElement("table");
document.body.appendChild(table);

const header = document.createElement("tr");
const nameHeader = document.createElement("th");
nameHeader.innerText = "Class Name";
header.appendChild(nameHeader);
const methodHeader = document.createElement("th");
methodHeader.innerText = "Methods";
header.appendChild(methodHeader);

table.appendChild(header);

const classes = [];
for (const [key, obj] of Object.entries(normalizedObjects)) {
  const name = obj.name;
  const deprecated =
    obj.deprecated ||
    [
      "DropDownList",
      "CheckBox",
      "Edit",
      "GroupList",
      "GuiList",
      "GuiTree",
      "Browser",
      "XmlDoc",
      "MouseRedir", //'Region', 'Application', 'File',
      "TreeItem",
      "CfgGroup",
    ].includes(obj.name);
  const methods = [];
  // if(obj.name == 'Menu') {debugger;}
  const klass = getClass(getFormattedId(key.toLowerCase()));
  console.log("KLASS:" + key, klass, obj);
  for (const method of obj.functions) {
    const params = method.parameters.map(
      ([type, name]) => `${name}<i> :${type}</i>`
    );
    const methodName =
      `${method.name}(${params.join(", ")})` +
      (method.result.length > 0 ? "<i> :" + method.result + "</i>" : "");
    const blacklist = method.name.startsWith("fx_");
    const mdeprecated = method.deprecated;
    const hook = method.name.toLowerCase().startsWith("on");
    if (hook) {
      methods.push({
        name: methodName,
        hook: true,
        deprecated: mdeprecated,
        blacklist,
      });
      continue;
    } else if (klass == null) {
      methods.push({
        name: methodName,
        status: "missing",
        deprecated: mdeprecated,
        blacklist,
      });
    } else {
      const impl = klass.prototype[method.name.toLowerCase()];
      if (impl == null) {
        methods.push({
          name: methodName,
          status: "missing",
          deprecated: mdeprecated,
          blacklist,
        });
      } else if (impl.length !== method.parameters.length) {
        methods.push({
          name: methodName,
          status: "wrong",
          deprecated: mdeprecated,
          blacklist,
        });
      } else {
        // const fake =  /\/\/TODO/.test(impl.toString());
        const code = impl.toString();
        const fake =
          code.split("\n").length <= 2 || /[Uu]nimplemented/.test(code);
        methods.push({
          name: methodName,
          status: "found",
          deprecated: mdeprecated,
          blacklist,
          fake,
        });
      }
    }
  }
  classes.push({ name, deprecated, methods, implemented: !!klass });
}

let total = 0;
let found = 0;
let dummy = 0;

for (const cls of classes) {
  const classRow = document.createElement("tr");
  // classRow.addEventListener("click", () => {
  //   classRow.classList.toggle("expanded");
  // });

  const className = document.createElement("td");
  className.classList.add("class-name");
  className.addEventListener("click", () => {
    classRow.classList.toggle("expanded");
  });

  let totalCount = 0;
  let foundCount = 0;
  // const totalCount = cls.methods.filter((m) => !m.hook).length;
  // const foundCount = cls.methods.filter(
  //   (m) => !m.hook && m.status === "found"
  // ).length;
  // if(!cls.deprecated){
  //   total += totalCount;
  //   found += foundCount;
  // }
  // className.innerText = `${cls.name} (${foundCount}/${totalCount})`;
  className.style.color = cls.deprecated ? "grey" : "black";
  classRow.appendChild(className);
  const methodsCell = document.createElement("td");
  classRow.appendChild(methodsCell);

  console.log("klass:", cls);
  total++;
  found += cls.implemented ? 1 : 0;

  for (const method of cls.methods) {
    if (method.hook) {
      continue;
    }
    totalCount++;
    const methodDiv = document.createElement("span");
    methodDiv.classList.add("method");
    // methodDiv.innerText = method.name;
    methodDiv.innerHTML = `<span>${method.name}</span>`;
    methodDiv.title = method.name;
    switch (method.status) {
      case "missing":
        methodDiv.style.backgroundColor = "pink";
        break;
      case "found":
        methodDiv.style.backgroundColor = "lightgreen";
        if (method.fake) {
          methodDiv.style.backgroundColor = "greenyellow";
          methodDiv.classList.add("fake");
          dummy++;
        }
        foundCount++;
        break;
      case "wrong":
        methodDiv.style.backgroundColor = "red";
        break;
    }
    methodsCell.appendChild(methodDiv);
    if (cls.deprecated) {
      methodDiv.style.backgroundColor = "white";
      // methodDiv.style.opacity = ".4";
      totalCount--;
    } else if (method.deprecated) {
      totalCount--;
      methodDiv.style.backgroundColor = "silver";
    } else if (method.blacklist) {
      totalCount--;
      methodDiv.style.backgroundColor = "coral";
    }
  }
  if (cls.methods.length == 0 || totalCount == 0) {
    //? has no method, lets keep it beauty.
    const methodDiv = document.createElement("span");
    methodDiv.classList.add("method");
    methodDiv.classList.add("dummy");
    methodsCell.appendChild(methodDiv);
  }

  className.innerText = `${cls.name} (${foundCount}/${totalCount})`;

  const methodDiv = document.createElement("span");
  // methodDiv.classList.add("method");
  methodDiv.classList.add("implementation");
  // methodDiv.innerText = cls.name;
  methodDiv.style.backgroundColor = cls.implemented
    ? "lightgreen"
    : cls.deprecated
    ? "white"
    : "pink";
  // methodDiv.title = ``;
  // methodsCell.appendChild(methodDiv);
  className.appendChild(methodDiv);

  total += totalCount;
  found += foundCount;

  table.appendChild(classRow);
}

methodHeader.innerText += ` (${found}/${total}, ${Math.round(
  (found / total) * 100
)}% Complete) | ${Math.round(((found - dummy) / total) * 100)}% Real.`;
