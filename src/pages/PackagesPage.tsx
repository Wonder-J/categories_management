import React from "react";
import PackageList from "../components/Packages/PackageList";

const PackagesPage: React.FC = () => {
  return (
    <div>
      <h2>套餐管理</h2>
      <PackageList />
    </div>
  );
};

export default PackagesPage;
