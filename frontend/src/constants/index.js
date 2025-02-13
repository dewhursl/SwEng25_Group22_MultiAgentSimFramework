import React from 'react';

import { GrConfigure } from "react-icons/gr";
import { MdOutline3dRotation } from "react-icons/md";
import { RiDashboardLine } from "react-icons/ri";

export const navLinks = [
    {
        id: 1,
        name: 'Configurator',
        href: '/configurator',
        icon: GrConfigure,
    },
    {
        id: 2,
        name: 'Renderer',
        href: '/renderer',
        icon: MdOutline3dRotation,
    },
    {
        id: 3,
        name: 'Dashboard',
        href: '/dashboard',
        icon: RiDashboardLine,
    },
];