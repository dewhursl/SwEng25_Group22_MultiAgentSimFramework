import React from 'react';

import { GrConfigure } from "react-icons/gr";
import { MdOutline3dRotation } from "react-icons/md";
import { MdDashboard } from "react-icons/md";
import { FaListUl } from "react-icons/fa6";

export const navLinks = [
    {
        id: 1,
        name: 'Configurator',
        href: '/configurator',
        icon: GrConfigure,
    },
    {
        id: 2,
        name: 'Catalog',
        href: '/simulations',
        icon: FaListUl,
    },
    {
        id: 3,
        name: 'Renderer',
        href: '/renderer',
        icon: MdOutline3dRotation,
    },
    {
        id: 4,
        name: 'Dashboard',
        href: '/dashboard',
        icon: MdDashboard,
    },
];

export const features = [
    {
        title: 'Agent Configurator',
        description:
            'Define roles, goals, and hyperparameters. Quickly tweak parameters for repeated simulations.',
        icon: GrConfigure,
    },
    {
        title: '3D Simulation Renderer',
        description:
            'Visualize multi-agent interactions in real-time, including adversarial or partial-information scenarios.',
        icon: MdOutline3dRotation,
    },
    {
        title: 'Analytics & Insights',
        description:
            'Track performance metrics, outcome distributions, and refine your approach with continuous feedback.',
        icon: MdDashboard,
    },
];