import GuiObj from "../makiClasses/GuiObj";

export function runInlineScript(script: string, context: object = {}) {
  for (const [key, value] of Object.entries(context)) {
    // console.log(`${key}: ${value}`);
    window[key] = value;
  }
  // console.log('runOnClick:', script)
  for (var expression of script.split(";")) {
    if (expression == "") continue;
    console.log(`/${expression}/`);
    if (expression.endsWith("()")) {
      expression = expression.replace(/\(\)/, "");
      try {
        window[expression]();
      } catch (error) {
        console.log(
          "failed to run expression:",
          `|${expression}|`,
          "@",
          script
        );

        console.warn(error);
        // throw error
      }
    }
    // console.log(`/${expression}/`)
  }
}

export function solvePendingProps(
  component: GuiObj,
  pendingProps: { [key: string]: string }
) {
  // sample: jscript:balance.top+12;
  // sample: jscript:eq1.top;
  // sample: jscript:balance.left+balance.width+27;
  // const re = /jscript:(\w+)\.(\w+)([\+|\-])*(\d+)*/gm;
  for (const [key, script] of Object.entries(pendingProps)) {
    const z: string[] = [];
    // const regex = /jscript:(\w+.\w+)(?:([\+|\-])([a-z\d\.]+))*/gm;
    const regex = /\w+\.\w+|[\+-]+|[0-9]+/gm;
    // let m: RegExpExecArray;
    let m = null;
    while ((m = regex.exec(script)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      // The result can be accessed through the `m`-variable.
      m.forEach((match, groupIndex) => {
        // console.log(`Found match, group ${groupIndex}: ${match}`);
        if (match != null) {
          z.push(match);
        }
      });
      // console.log("----------");
    }
    // console.log("============", z);
    // this.setXmlAttr(key, value);
    let sign = "+";
    let num: number;
    // m = re.exec(script)
    // console.log('  --for',key, script, 'M==',m)
    if (z.length) {
      let result = 0;
      let msg = "";
      // console.log('--pendingProp, y=',this._y, key, m)
      // for(var i=1; i< m.length; i++)
      z.forEach((s, index) => {
        if (/* index == 0 || */ s == null) {
          return;
        } else if (s.indexOf(".") > 0) {
          const [id, attr] = s.split(".");
          const el = component.findobject(id);
          if (el) {
            num = el["get" + attr]();
            if (!isNaN(num)) {
              if (sign == "-") {
                num *= -1;
              }
              result += num;
            }
          }
          // console.log("id:", id, attr);
          msg += `[${id}.${attr}=${num}]`;
        } else if (s == "+" || s == "-") {
          sign = s;
          // console.log('exp:', s)
          msg += s;
        } else {
          num = parseInt(s);
          if (!isNaN(num)) {
            if (sign == "-") {
              num *= -1;
            }
            result += num;
            msg += String(num);
          } else {
            msg += ` [Failed to process: ${s}]`;
          }
        }
      });
      // const [_,id,attribute, sign,num] = m
      // console.log('pendingProp:',id,attribute, sign,num)
      // console.log("pendingProp:", msg, ">>", key, "@", script, "==", result);
      component.setXmlAttr(key, result.toString());
    }
  }
}
