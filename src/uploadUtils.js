import { API_URL } from "./constants";
export async function upload(file) {
  const formData = new FormData();
  formData.append("skin", file, file.name);

  const postResponse = await fetch(`${API_URL}/skins/`, {
    method: "POST",
    body: formData,
  });

  return postResponse.json();
}

export async function checkMd5sAreMissing(md5s) {
  const response = await fetch(`${API_URL}/skins/missing`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hashes: md5s }),
  });
  const { missing, found } = await response.json();
  return { missing, found };
}

export async function hashFile(file) {
  const { hashFile: hasher } = await import("./hashFile");
  return hasher(file);
}

/* SKIN UPLOAD UTILS */
const validSkinFilename = /(\.wsz)|(\.zip)$/i;

export function isValidSkinFilename(filename) {
  return validSkinFilename.test(filename);
}

export async function isClassicSkin(file) {
  const JSZip = await import("jszip");
  try {
    const zip = await JSZip.loadAsync(file);
    return zip.file(/main\.bmp$/i).length > 0;
  } catch (e) {
    // TODO: We could give a better message here.
    console.error(e);
    return false;
  }
}
