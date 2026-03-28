(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/apps/portal/src/lib/auth-context.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PortalAuthProvider",
    ()=>PortalAuthProvider,
    "usePortalAuth",
    ()=>usePortalAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/apps/portal/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/portal/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/portal/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
const PortalAuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    hasRole: ()=>false,
    hasPermission: ()=>false
});
const API_BASE = `${("TURBOPACK compile-time value", "http://localhost:4000") || 'http://localhost:4000'}/api/v1`;
function PortalAuthProvider({ children }) {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PortalAuthProvider.useEffect": ()=>{
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
        }
    }["PortalAuthProvider.useEffect"], []);
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PortalAuthContext.Provider, {
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
_s(PortalAuthProvider, "YajQB7LURzRD+QP5gw0+K2TZIWA=");
_c = PortalAuthProvider;
function usePortalAuth() {
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(PortalAuthContext);
}
_s1(usePortalAuth, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
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
var _c;
__turbopack_context__.k.register(_c, "PortalAuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=apps_portal_src_lib_auth-context_tsx_12-cqhp._.js.map