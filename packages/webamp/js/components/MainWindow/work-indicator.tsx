import * as React from "react";
import classnames from "classnames";
import { useTypedSelector } from "../../hooks";
import * as Selectors from "../../selectors";
import { MEDIA_STATUS } from "../../constants";

export default function WorkIndicator() {
    const kbps = useTypedSelector(Selectors.getKbps);
    const khz = useTypedSelector(Selectors.getKhz);
    const mediaStatus = useTypedSelector(Selectors.getMediaStatus);

    const working =
    mediaStatus === MEDIA_STATUS.PLAYING &&
    !(kbps != null &&
    khz != null &&
    kbps.trim() !== "0");

    return (
        <div
        id="work-indicator"
        className={classnames({ selected: working })}
        />
    );
}
