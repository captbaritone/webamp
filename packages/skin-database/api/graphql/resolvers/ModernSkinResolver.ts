import SkinModel from "../../../data/SkinModel";
import { ISkin } from "./CommonSkinResolver";
import { NodeResolver, toId } from "./NodeResolver";
import path from "path";
import { ID } from "grats";
import { XMLParser } from "fast-xml-parser";

/**
 * A "modern" Winamp skin. These skins use the `.wal` file extension and are free-form.
 *
 * Most functionality in the Winamp Skin Museum is centered around "classic" skins,
 * which are currently called just `Skin` in this schema.
 * @gqlType ModernSkin */
export default class ModernSkinResolver implements NodeResolver, ISkin {
  _model: SkinModel;
  __typename = "ModernSkin";

  md5(): string {
    return this._model.getMd5();
  }
  async filename(normalize_extension: boolean): Promise<string> {
    const filename = await this._model.getFileName();
    if (normalize_extension) {
      return path.parse(filename).name + ".wal";
    }
    return filename;
  }

  /* TODO: Get all of these from the parent class/interface */

  id(): ID {
    return toId(this.__typename, this.md5());
  }

  museum_url(): string | null {
    return null;
  }
  webamp_url(): string | null {
    return null;
  }

  async screenshot_url(): Promise<string | null> {
    const archiveFiles = await this._model.getArchiveFiles();
    const skinXml = archiveFiles.find((f) =>
      f.getFileName().match(/skin\.xml$/i)
    );

    if (skinXml == null) {
      return null;
    }
    const xmlContent = await skinXml.getTextContent();
    if (xmlContent == null) {
      return null;
    }

    const parser = new XMLParser();
    const parsedXml = parser.parse(xmlContent);
    const screenshotPath =
      parsedXml?.WinampAbstractionLayer?.skininfo?.screenshot;
    if (screenshotPath == null) {
      return null;
    }

    const screenshotFile = archiveFiles.find((f) => {
      const fileName = f.getFileName().toLowerCase();
      const normalizedScreenshotPath = screenshotPath.toLowerCase();
      return (
        fileName === normalizedScreenshotPath ||
        fileName === `/${normalizedScreenshotPath}` ||
        fileName === `\\${normalizedScreenshotPath}`
      );
    });

    console.log({ screenshotFile });
    if (screenshotFile == null) {
      return null;
    }

    return screenshotFile.getUrl();
  }
  async readme_text(): Promise<string | null> {
    return null;
  }
  async nsfw(): Promise<boolean | null> {
    return null;
  }
  average_color(): string | null {
    return null;
  }
}
