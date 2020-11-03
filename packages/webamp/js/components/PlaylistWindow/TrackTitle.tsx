import * as Selectors from "../../selectors";
import { useTypedSelector } from "../../hooks";

interface Props {
  id: number;
  paddedTrackNumber: string;
}

const TrackTitle = ({ id, paddedTrackNumber }: Props) => {
  const title = useTypedSelector(Selectors.getTrackDisplayName)(id);
  return (
    <span>
      {paddedTrackNumber}. {title}
    </span>
  );
};

export default TrackTitle;
