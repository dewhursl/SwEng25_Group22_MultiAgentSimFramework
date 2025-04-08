import React from 'react';

import { GrConfigure } from "react-icons/gr";
import { FaListUl } from "react-icons/fa6";
import { FaImage } from 'react-icons/fa6';
import { RiDashboardHorizontalFill } from "react-icons/ri";

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
        icon: FaImage,
    },
    {
        id: 4,
        name: 'Dashboard',
        href: '/dashboard',
        icon: RiDashboardHorizontalFill,
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
        icon: FaImage,
    },
    {
        title: 'Analytics & Insights',
        description:
            'Track performance metrics, outcome distributions, and refine your approach with continuous feedback.',
        icon: RiDashboardHorizontalFill,
    },
];