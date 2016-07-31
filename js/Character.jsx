import React from 'react';

module.exports = (props) => {
  const char = '' + props.children;
  const className = `character character-${char.toLowerCase().charCodeAt(0)}`;
  return <div {...props} className={className}>{props.children}</div>;
};

// TODO: Require that props.children be a string
