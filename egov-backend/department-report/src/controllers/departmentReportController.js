const setting = require("../../setting");
const {
    getDepartmentPerformance,
    getTeamPerformance,
    getAllActiveApplicationList,
    exportDepartmentPerformanceToExcel,
    exportDepartmentPerformanceToPDF,
    exportTeamPerformanceToExcel,
    exportTeamPerformanceToPDF,
    getServicePerformanceUser,
    getServiceTicketPerformanceUser,
    exportAgentPerformanceToExcel,
    exportAgentPerformanceToPDF,
    exportAgentTicketPerformanceToExcel,
    exportAgentTicketPerformanceToPDF,
} = require("../services/departmentReport.service");
const { generateReportExcelData } = require("../utils/common");
const { generatePDF } = require("../utils/generatePDF");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");
const fs = require("fs");
const path = require("path");

const getDepartmentPerformanceData = async (req, res) => {
    try {
        const reqBody = req.body.data;

        const result = await getDepartmentPerformance(reqBody);
        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.DEPARTMENT.APPLICATION_REPORT_FETCH,
                success: true,
                data: { ...result },
            });
        }
    } catch (error) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: MESSAGES.SERVER_ERROR,
            success: false,
            data: {},
        });
    }
};
const getServicePerformanceDataByUser = async (req, res) => {
    try {
        const reqBody = req.body.data;

        const result = await getServicePerformanceUser(reqBody);
        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.DEPARTMENT.APPLICATION_REPORT_FETCH,
                success: true,
                data: result,
            });
        }
    } catch (error) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: MESSAGES.SERVER_ERROR,
            success: false,
            data: {},
        });
    }
};
const getServiceTicketPerformanceDataByUser = async (req, res) => {
    try {
        const reqBody = req.body.data;

        const result = await getServiceTicketPerformanceUser(reqBody);
        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.DEPARTMENT.APPLICATION_REPORT_FETCH,
                success: true,
                data: result,
            });
        }
    } catch (error) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: MESSAGES.SERVER_ERROR,
            success: false,
            data: {},
        });
    }
};
const getTeamPerformanceData = async (req, res) => {
    try {
        const reqBody = req.body.data;

        const result = await getTeamPerformance(reqBody);
        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.DEPARTMENT.APPLICATION_REPORT_FETCH,
                success: true,
                data: { ...result },
            });
        }
    } catch (error) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: MESSAGES.SERVER_ERROR,
            success: false,
            data: {},
        });
    }
};

const exportDepartmentReport = async (req, res) => {
    try {
        const reqBody = req.body.data;
        const result = await exportTeamPerformanceToExcel(reqBody);
        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message:
                    MESSAGES.DEPARTMENT.APPLICATION_REPORT_FETCH,
                success: true,
                data: { result },
            });
        }
    } catch (error) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: MESSAGES.SERVER_ERROR,
            success: false,
            data: error.message,
        });
    }
}

const generateReportPdf = async (req, res) => {
    try {
        const reqBody = req.body.data;
        const result = await exportTeamPerformanceToPDF(reqBody, req);
        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.DEPARTMENT.APPLICATION_REPORT_FETCH,
                success: true,
                data: { result },
            });
        }
    } catch (error) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: MESSAGES.SERVER_ERROR,
            success: false,
            data: error.message,
        });
    }
};

const removeReportPdf = async (req, res) => {
    try {
        const { fileName } = req.body.data;

        const desirePath = path.join(
            setting.PROJECT_DIR,
            "public"
        );
        const filePath = path.join(desirePath, fileName);

        fs.stat(filePath, (err, stats) => {
            if (err) {
                console.error("Error finding file:", err);
                return res.status(404).json({
                    message: "File not found",
                    success: false,
                    data: {},
                });
            }

            if (stats.isFile()) {
                fs.unlink(filePath, (error) => {
                    if (error) {
                        console.error("Error deleting file:", error);
                        return res.status(500).json({
                            message: "Could not delete file",
                            success: false,
                            data: {},
                        });
                    }

                    return res.status(200).json({
                        message: "File deleted successfully",
                        success: true,
                        data: {},
                    });
                });
            } else {
                console.error("Path is not a file");
                return res.status(400).json({
                    message: "Path is not a file",
                    success: false,
                    data: {},
                });
            }
        });
    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({
            message: "Server Error",
            success: false,
            data: {},
        });
    }
};

const removeReportExcel = async (req, res) => {
    try {
        const { fileName } = req.body.data;

        const desirePath = path.join(setting.PROJECT_DIR, "public");
        const filePath = path.join(desirePath, fileName);

        fs.stat(filePath, (err, stats) => {
            if (err) {
                console.error("Error finding file:", err);
                return res.status(404).json({
                    message: "File not found",
                    success: false,
                    data: {},
                });
            }

            if (stats.isFile()) {
                fs.unlink(filePath, (error) => {
                    if (error) {
                        console.error("Error deleting file:", error);
                        return res.status(500).json({
                            message: "Could not delete file",
                            success: false,
                            data: {},
                        });
                    }

                    return res.status(200).json({
                        message: "File deleted successfully",
                        success: true,
                        data: {},
                    });
                });
            } else {
                console.error("Path is not a file");
                return res.status(400).json({
                    message: "Path is not a file",
                    success: false,
                    data: {},
                });
            }
        });
    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({
            message: "Server Error",
            success: false,
            data: {},
        });
    }
};

const activeApplicationList = async (req, res) => {
    try {
        let activeApplicationData = await getAllActiveApplicationList();
        if (activeApplicationData) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.DEPARTMENT.APPLICATION_REPORT_FETCH,
                success: true,
                data: { ...activeApplicationData },
            });
        } else {
            return res.status(STATUS_CODES.SERVER_ERROR).json({
                message: MESSAGES.DEPARTMENT.APPLICATION_REPORT_FETCH_FAILED,
                success: false,
                data: {},
            });
        }
    } catch (error) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: MESSAGES.SERVER_ERROR,
            success: false,
            data: {},
        });
    }
};

const exportDepartmentPerformanceExcel = async (req, res) => {
    try {
        const reqBody = req.body.data;
        const result = await exportDepartmentPerformanceToExcel(reqBody);
        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message:
                    MESSAGES.DEPARTMENT.APPLICATION_REPORT_FETCH,
                success: true,
                data: { result },
            });
        }
    } catch (error) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: MESSAGES.SERVER_ERROR,
            success: false,
            data: error.message,
        });
    }
}

const removeDepartmentPerformanceExcel = async (req, res) => {
    try {
        const { fileName } = req.body.data;

        const desirePath = path.join(setting.PROJECT_DIR, "public");
        const filePath = path.join(desirePath, fileName);

        fs.stat(filePath, (err, stats) => {
            if (err) {
                console.error("Error finding file:", err);
                return res.status(404).json({
                    message: "File not found",
                    success: false,
                    data: {},
                });
            }

            if (stats.isFile()) {
                fs.unlink(filePath, (error) => {
                    if (error) {
                        console.error("Error deleting file:", error);
                        return res.status(500).json({
                            message: "Could not delete file",
                            success: false,
                            data: {},
                        });
                    }

                    return res.status(200).json({
                        message: "File deleted successfully",
                        success: true,
                        data: {},
                    });
                });
            } else {
                console.error("Path is not a file");
                return res.status(400).json({
                    message: "Path is not a file",
                    success: false,
                    data: {},
                });
            }
        });
    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({
            message: "Server Error",
            success: false,
            data: {},
        });
    }
};

const exportDepartmentPerformanceInPDF = async (req, res) => {
    try {
        const reqBody = req.body.data;
        const result = await exportDepartmentPerformanceToPDF(reqBody, req);
        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.DEPARTMENT.APPLICATION_REPORT_FETCH,
                success: true,
                data: { result },
            });
        }
    } catch (error) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: MESSAGES.SERVER_ERROR,
            success: false,
            data: error.message,
        });
    }
};

const removeDepartmentPerformancePdf = async (req, res) => {
    try {
        const { fileName } = req.body.data;

        const desirePath = path.join(
            setting.PROJECT_DIR,
            "public"
        );
        const filePath = path.join(desirePath, fileName);

        fs.stat(filePath, (err, stats) => {
            if (err) {
                console.error("Error finding file:", err);
                return res.status(404).json({
                    message: "File not found",
                    success: false,
                    data: {},
                });
            }

            if (stats.isFile()) {
                fs.unlink(filePath, (error) => {
                    if (error) {
                        console.error("Error deleting file:", error);
                        return res.status(500).json({
                            message: "Could not delete file",
                            success: false,
                            data: {},
                        });
                    }

                    return res.status(200).json({
                        message: "File deleted successfully",
                        success: true,
                        data: {},
                    });
                });
            } else {
                console.error("Path is not a file");
                return res.status(400).json({
                    message: "Path is not a file",
                    success: false,
                    data: {},
                });
            }
        });
    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({
            message: "Server Error",
            success: false,
            data: {},
        });
    }
};

const exportAgenetPerformanceExcel = async (req, res) => {
    try {
        const reqBody = req.body.data;
        const result = await exportAgentPerformanceToExcel(reqBody);
        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message:
                    MESSAGES.DEPARTMENT.APPLICATION_REPORT_FETCH,
                success: true,
                data: { result },
            });
        }
    } catch (error) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: MESSAGES.SERVER_ERROR,
            success: false,
            data: error.message,
        });
    }
}

const removeAgenetPerformanceExcel = async (req, res) => {
    try {
        const { fileName } = req.body.data;

        const desirePath = path.join(setting.PROJECT_DIR, "public");
        const filePath = path.join(desirePath, fileName);

        fs.stat(filePath, (err, stats) => {
            if (err) {
                console.error("Error finding file:", err);
                return res.status(404).json({
                    message: "File not found",
                    success: false,
                    data: {},
                });
            }

            if (stats.isFile()) {
                fs.unlink(filePath, (error) => {
                    if (error) {
                        console.error("Error deleting file:", error);
                        return res.status(500).json({
                            message: "Could not delete file",
                            success: false,
                            data: {},
                        });
                    }

                    return res.status(200).json({
                        message: "File deleted successfully",
                        success: true,
                        data: {},
                    });
                });
            } else {
                console.error("Path is not a file");
                return res.status(400).json({
                    message: "Path is not a file",
                    success: false,
                    data: {},
                });
            }
        });
    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({
            message: "Server Error",
            success: false,
            data: {},
        });
    }
};

const exportAgenetPerformanceInPDF = async (req, res) => {
    try {
        const reqBody = req.body.data;
        const result = await exportAgentPerformanceToPDF(reqBody, req);
        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.DEPARTMENT.APPLICATION_REPORT_FETCH,
                success: true,
                data: { result },
            });
        }
    } catch (error) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: MESSAGES.SERVER_ERROR,
            success: false,
            data: error.message,
        });
    }
};

const removeAgenetPerformancePdf = async (req, res) => {
    try {
        const { fileName } = req.body.data;

        const desirePath = path.join(
            setting.PROJECT_DIR,
            "public"
        );
        const filePath = path.join(desirePath, fileName);

        fs.stat(filePath, (err, stats) => {
            if (err) {
                console.error("Error finding file:", err);
                return res.status(404).json({
                    message: "File not found",
                    success: false,
                    data: {},
                });
            }

            if (stats.isFile()) {
                fs.unlink(filePath, (error) => {
                    if (error) {
                        console.error("Error deleting file:", error);
                        return res.status(500).json({
                            message: "Could not delete file",
                            success: false,
                            data: {},
                        });
                    }

                    return res.status(200).json({
                        message: "File deleted successfully",
                        success: true,
                        data: {},
                    });
                });
            } else {
                console.error("Path is not a file");
                return res.status(400).json({
                    message: "Path is not a file",
                    success: false,
                    data: {},
                });
            }
        });
    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({
            message: "Server Error",
            success: false,
            data: {},
        });
    }
};

const exportAgenetTicketPerformanceExcel = async (req, res) => {
    try {
        const reqBody = req.body.data;
        const result = await exportAgentTicketPerformanceToExcel(reqBody);
        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message:
                    MESSAGES.DEPARTMENT.APPLICATION_REPORT_FETCH,
                success: true,
                data: { result },
            });
        }
    } catch (error) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: MESSAGES.SERVER_ERROR,
            success: false,
            data: error.message,
        });
    }
}

const removeAgenetTicketPerformanceExcel = async (req, res) => {
    try {
        const { fileName } = req.body.data;

        const desirePath = path.join(setting.PROJECT_DIR, "public");
        const filePath = path.join(desirePath, fileName);

        fs.stat(filePath, (err, stats) => {
            if (err) {
                console.error("Error finding file:", err);
                return res.status(404).json({
                    message: "File not found",
                    success: false,
                    data: {},
                });
            }

            if (stats.isFile()) {
                fs.unlink(filePath, (error) => {
                    if (error) {
                        console.error("Error deleting file:", error);
                        return res.status(500).json({
                            message: "Could not delete file",
                            success: false,
                            data: {},
                        });
                    }

                    return res.status(200).json({
                        message: "File deleted successfully",
                        success: true,
                        data: {},
                    });
                });
            } else {
                console.error("Path is not a file");
                return res.status(400).json({
                    message: "Path is not a file",
                    success: false,
                    data: {},
                });
            }
        });
    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({
            message: "Server Error",
            success: false,
            data: {},
        });
    }
};

const exportAgenetTicketPerformanceInPDF = async (req, res) => {
    try {
        const reqBody = req.body.data;
        const result = await exportAgentTicketPerformanceToPDF(reqBody, req);
        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.DEPARTMENT.APPLICATION_REPORT_FETCH,
                success: true,
                data: { result },
            });
        }
    } catch (error) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: MESSAGES.SERVER_ERROR,
            success: false,
            data: error.message,
        });
    }
};

const removeAgenetTicketPerformancePdf = async (req, res) => {
    try {
        const { fileName } = req.body.data;

        const desirePath = path.join(
            setting.PROJECT_DIR,
            "public"
        );
        const filePath = path.join(desirePath, fileName);

        fs.stat(filePath, (err, stats) => {
            if (err) {
                console.error("Error finding file:", err);
                return res.status(404).json({
                    message: "File not found",
                    success: false,
                    data: {},
                });
            }

            if (stats.isFile()) {
                fs.unlink(filePath, (error) => {
                    if (error) {
                        console.error("Error deleting file:", error);
                        return res.status(500).json({
                            message: "Could not delete file",
                            success: false,
                            data: {},
                        });
                    }

                    return res.status(200).json({
                        message: "File deleted successfully",
                        success: true,
                        data: {},
                    });
                });
            } else {
                console.error("Path is not a file");
                return res.status(400).json({
                    message: "Path is not a file",
                    success: false,
                    data: {},
                });
            }
        });
    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({
            message: "Server Error",
            success: false,
            data: {},
        });
    }
};

module.exports = {
    getDepartmentPerformanceData,
    getServicePerformanceDataByUser,
    getServiceTicketPerformanceDataByUser,
    getTeamPerformanceData,
    exportDepartmentReport,
    generateReportPdf,
    removeReportPdf,
    removeReportExcel,
    activeApplicationList,
    exportDepartmentPerformanceExcel,
    removeDepartmentPerformanceExcel,
    exportDepartmentPerformanceInPDF,
    removeDepartmentPerformancePdf,
    exportAgenetPerformanceExcel,
    removeAgenetPerformanceExcel,
    exportAgenetPerformanceInPDF,
    removeAgenetPerformancePdf,
    exportAgenetTicketPerformanceExcel,
    removeAgenetTicketPerformanceExcel,
    exportAgenetTicketPerformanceInPDF,
    removeAgenetTicketPerformancePdf
};
