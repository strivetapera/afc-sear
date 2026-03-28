module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/apps/portal/src/lib/auth-context.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PortalAuthProvider",
    ()=>PortalAuthProvider,
    "usePortalAuth",
    ()=>usePortalAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/portal/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/portal/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const PortalAuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    hasRole: ()=>false,
    hasPermission: ()=>false
});
const API_BASE = `${("TURBOPACK compile-time value", "http://localhost:4000") || 'http://localhost:4000'}/api/v1`;
function PortalAuthProvider({ children }) {
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        async function loadUser() {
            try {
                const response = await fetch(`${API_BASE}/me`, {
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    const userData = data.data;
                    setUser({
                        id: userData.id,
                        email: userData.email,
                        name: userData.name || userData.person?.firstName,
                        roles: extractRoles(userData),
                        branchId: userData.defaultBranchId || userData.person?.branchId,
                        branchName: userData.branch?.name,
                        personId: userData.personId || userData.person?.id
                    });
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Failed to load user:', error);
                setUser(null);
            } finally{
                setIsLoading(false);
            }
        }
        loadUser();
    }, []);
    const hasRole = (role)=>{
        if (!user) return false;
        if (user.roles.includes('super_admin')) return true;
        const roles = Array.isArray(role) ? role : [
            role
        ];
        return roles.some((r)=>user.roles.includes(r));
    };
    const hasPermission = (permission)=>{
        if (!user) return false;
        if (user.roles.includes('super_admin')) return true;
        const rolePermissions = {
            branch_admin: [
                'view_branch_content',
                'manage_branch_content',
                'view_branch_members',
                'manage_branch_events'
            ],
            leader: [
                'view_branch_content',
                'view_branch_members',
                'manage_branch_events'
            ],
            staff: [
                'view_branch_content',
                'view_branch_members'
            ],
            member: [
                'view_public_content',
                'view_own_profile',
                'manage_own_registrations'
            ]
        };
        const userPermissions = user.roles.flatMap((r)=>rolePermissions[r] || []);
        return userPermissions.includes(permission);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PortalAuthContext.Provider, {
        value: {
            user,
            isLoading,
            isAuthenticated: !!user,
            hasRole,
            hasPermission
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/apps/portal/src/lib/auth-context.tsx",
        lineNumber: 113,
        columnNumber: 5
    }, this);
}
function usePortalAuth() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(PortalAuthContext);
}
function extractRoles(userData) {
    const roles = [];
    if (userData.userRoles) {
        for (const ur of userData.userRoles){
            const roleKey = ur.role?.key;
            if (roleKey === 'super_admin') {
                roles.push('super_admin');
            } else if (roleKey === 'branch_admin') {
                roles.push('branch_admin');
            }
        }
    }
    const lifecycleStage = userData.person?.lifecycleStage;
    if (lifecycleStage === 'LEADER') {
        if (!roles.includes('leader')) roles.push('leader');
    } else if (lifecycleStage === 'STAFF') {
        if (!roles.includes('staff')) roles.push('staff');
    } else if (lifecycleStage === 'MEMBER') {
        if (!roles.includes('member')) roles.push('member');
    } else if (lifecycleStage === 'VISITOR') {
        if (!roles.includes('visitor')) roles.push('visitor');
    }
    if (roles.length === 0) {
        roles.push('member');
    }
    return roles;
}
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__08-4xp3._.js.map