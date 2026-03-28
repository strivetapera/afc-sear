module.exports = [
"[project]/apps/portal/src/app/login/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LoginPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/portal/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/portal/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/portal/node_modules/next/navigation.js [app-ssr] (ecmascript)");
"use client";
;
;
;
const API_URL = ("TURBOPACK compile-time value", "http://localhost:4000") || 'http://localhost:4000/api/v1';
function LoginPage() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        email: '',
        password: ''
    });
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleSubmit = async (e)=>{
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/auth/sign-in/email-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form),
                credentials: 'include'
            });
            if (!response.ok) {
                const data = await response.json().catch(()=>({}));
                throw new Error(data.message || 'Sign-in failed. Check your credentials.');
            }
            router.push('/dashboard');
            router.refresh();
        } catch (err) {
            setError(err.message ?? 'An unexpected error occurred.');
        } finally{
            setIsLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 50%, #c7d2fe 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                background: '#fff',
                borderRadius: 16,
                padding: 40,
                width: '100%',
                maxWidth: 400,
                boxShadow: '0 20px 60px rgba(79,70,229,0.2)'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        textAlign: 'center',
                        marginBottom: 32
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                width: 48,
                                height: 48,
                                borderRadius: 12,
                                background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
                                margin: '0 auto 12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: 20
                                },
                                children: "A"
                            }, void 0, false, {
                                fileName: "[project]/apps/portal/src/app/login/page.tsx",
                                lineNumber: 56,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/apps/portal/src/app/login/page.tsx",
                            lineNumber: 51,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            style: {
                                fontSize: 24,
                                fontWeight: 700,
                                color: '#0f172a',
                                marginBottom: 4
                            },
                            children: "Welcome Back"
                        }, void 0, false, {
                            fileName: "[project]/apps/portal/src/app/login/page.tsx",
                            lineNumber: 58,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            style: {
                                color: '#64748b',
                                fontSize: 14
                            },
                            children: "Sign in to your member portal"
                        }, void 0, false, {
                            fileName: "[project]/apps/portal/src/app/login/page.tsx",
                            lineNumber: 59,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/portal/src/app/login/page.tsx",
                    lineNumber: 50,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleSubmit,
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16
                    },
                    children: [
                        error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: 8,
                                padding: '10px 14px',
                                color: '#dc2626',
                                fontSize: 13
                            },
                            children: error
                        }, void 0, false, {
                            fileName: "[project]/apps/portal/src/app/login/page.tsx",
                            lineNumber: 64,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    style: {
                                        fontSize: 13,
                                        fontWeight: 500,
                                        color: '#374151',
                                        display: 'block',
                                        marginBottom: 6
                                    },
                                    children: "Email Address"
                                }, void 0, false, {
                                    fileName: "[project]/apps/portal/src/app/login/page.tsx",
                                    lineNumber: 72,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "email",
                                    value: form.email,
                                    onChange: (e)=>setForm((f)=>({
                                                ...f,
                                                email: e.target.value
                                            })),
                                    placeholder: "you@example.com",
                                    required: true,
                                    style: {
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 8,
                                        fontSize: 14,
                                        outline: 'none',
                                        transition: 'border-color 0.15s'
                                    },
                                    onFocus: (e)=>e.target.style.borderColor = '#6366f1',
                                    onBlur: (e)=>e.target.style.borderColor = '#e2e8f0'
                                }, void 0, false, {
                                    fileName: "[project]/apps/portal/src/app/login/page.tsx",
                                    lineNumber: 75,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/portal/src/app/login/page.tsx",
                            lineNumber: 71,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    style: {
                                        fontSize: 13,
                                        fontWeight: 500,
                                        color: '#374151',
                                        display: 'block',
                                        marginBottom: 6
                                    },
                                    children: "Password"
                                }, void 0, false, {
                                    fileName: "[project]/apps/portal/src/app/login/page.tsx",
                                    lineNumber: 90,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "password",
                                    value: form.password,
                                    onChange: (e)=>setForm((f)=>({
                                                ...f,
                                                password: e.target.value
                                            })),
                                    placeholder: "••••••••",
                                    required: true,
                                    style: {
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 8,
                                        fontSize: 14,
                                        outline: 'none'
                                    },
                                    onFocus: (e)=>e.target.style.borderColor = '#6366f1',
                                    onBlur: (e)=>e.target.style.borderColor = '#e2e8f0'
                                }, void 0, false, {
                                    fileName: "[project]/apps/portal/src/app/login/page.tsx",
                                    lineNumber: 93,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/portal/src/app/login/page.tsx",
                            lineNumber: 89,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "submit",
                            disabled: isLoading,
                            style: {
                                background: isLoading ? '#a5b4fc' : 'linear-gradient(135deg, #4f46e5, #6366f1)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                padding: '12px',
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                marginTop: 4,
                                transition: 'opacity 0.15s'
                            },
                            children: isLoading ? 'Signing in…' : 'Sign In'
                        }, void 0, false, {
                            fileName: "[project]/apps/portal/src/app/login/page.tsx",
                            lineNumber: 107,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/portal/src/app/login/page.tsx",
                    lineNumber: 62,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/portal/src/app/login/page.tsx",
            lineNumber: 46,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/portal/src/app/login/page.tsx",
        lineNumber: 41,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=apps_portal_src_app_login_page_tsx_0j0-qe2._.js.map