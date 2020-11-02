import SuspenseImage from "./SuspenseImage";

type Props = {
  src: string;
};
export default function IconImage({ src }: Props) {
  return <SuspenseImage src={src} style={{ width: 32, height: 32 }} />;
}
