import MainLayout from "./MainLayout";
import { Outlet } from "react-router-dom";

export default function DashboardPage() {
    return (
        <MainLayout>
            <Outlet />
        </MainLayout>
    );
}
