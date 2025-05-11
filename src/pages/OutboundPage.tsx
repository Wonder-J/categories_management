import React from "react";
import OutboundList from "../components/Outbound/OutboundList";

const OutboundPage: React.FC = () => {
  return (
    <div>
      <h2>出库管理</h2>
      <OutboundList />
    </div>
  );
};

export default OutboundPage;
