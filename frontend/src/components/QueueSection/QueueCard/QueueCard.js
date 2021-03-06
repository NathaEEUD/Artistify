import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import {
  Card,
  CardActionArea,
  CardContent,
  CardActions,
  CardMedia,
  Tooltip,
  Typography,
  IconButton,
} from "@material-ui/core";
import { formatVideoTitle } from "../../../functions";
import ClearIcon from "@material-ui/icons/Clear";

const style = {
  cursor: "move",
  display: "inline-block",
  width: "100px",
};

export default function ImgMediaCard({
  id,
  index,
  nowPlaying,
  onClickImage,
  moveCard,
  qid,
  queue,
  setQueue,
  smallThumbnailUrl,
  title,
}) {
  const ref = useRef(null);

  const removeQueueItem = () => {
    setQueue(
      queue.filter((item) => {
        return item.qid !== qid;
      })
    );
  };

  const [, drop] = useDrop({
    accept: "card",
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex);
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    item: { type: "card", id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  return (
    <Card
      ref={ref}
      style={{
        marginLeft: "41.5px",
        marginTop: "25px",
        backgroundColor: (nowPlaying && nowPlaying.qid) === qid && "#2ad156",
        ...style,
        opacity,
      }}
    >
      <CardActionArea style={{ height: "100px" }} onClick={() => onClickImage(qid)}>
        <CardMedia
          component="img"
          alt={title}
          height="70"
          image={smallThumbnailUrl}
          title={title}
        />
        <CardContent style={{ height: "40px" }}>
          <Typography style={{ fontSize: "9px" }} gutterBottom>
            {formatVideoTitle(title)}
          </Typography>
        </CardContent>
      </CardActionArea>

      <CardActions style={{ display: "flex", justifyContent: "flex-end" }}>
        <Tooltip title="remove from queue">
          <IconButton
            edge="end"
            color="secondary"
            onClick={removeQueueItem}
            size="small"
            style={{ color: "red" }}
          >
            <ClearIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
