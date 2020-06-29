import React from "react";
import { RouteComponentProps } from "react-router-dom";
import Room from "../features/room/Room";

type TParams = { slug: string };
interface Props extends RouteComponentProps<TParams> {}

export const RoomShow: React.FC<Props> = ({ match }) => {
  console.log('rendering roomshow')
  const {
    params: { slug },
  } = match;
  return <Room slug={slug} />;
};
export default RoomShow;
