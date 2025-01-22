const setting = require("../../setting");
const { ticketsModel, ticketsLogModel } = require("../models");
const ticketChatModel = require("../models/ticketChat");
const {
    createNewTicket,
    updateTicketData,
    getTicketList,
    createNewTicketLog,
    updateStatusById,
    updatePriorityById,
    updateAssignUserId,
    sendNewMessage,
    getTicketChatData,
    updateTicketById,
    updateTicketLogStatus,
    exportTickets,
    getTicketLogsData,
    TicketCountStatusWise,
    getTicketAllList,
    getTicketListByCustomerId,
    getLatestActivityDate,
    reOpenTicketService,
} = require("../services/ticket.service");
const { generateExcelData } = require("../utils/common");
// const { supportMail } = require("../utils/mail/sendMail");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");
const fs = require("fs");
const path = require("path");
const { default: axios } = require("axios");


function getMonthName(date) {
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    return months[date.getMonth()];
}

function formatDate(dateString) {
    // Parse the input date string
    const date = new Date(dateString);

    // Format the date in the desired format (08 Mar, 2024)
    const formattedDate = `${("0" + date.getDate()).slice(-2)} ${getMonthName(
        date
    )}, ${date.getFullYear()}`;

    // Format the time in the desired format (01:00 PM)
    const formattedTime = `${("0" + date.getHours()).slice(-2)}:${(
        "0" + date.getMinutes()
    ).slice(-2)} ${date.getHours() >= 12 ? "PM" : "AM"}`;

    return `${formattedDate} ${formattedTime}`;
}

const getStatus = (priority) => {
    switch (parseInt(priority)) {
        case 0:
            return "New";
        case 1:
            return "Pending";
        case 2:
            return "In Progress";
        case 3:
            return "Completed";
        default:
            return "Unknown";
    }
};

const createTicket = async (req, res) => {
    try {
        const reqBody = req.body.data;
        let newTicketData = await createNewTicket(reqBody, req);

        if (newTicketData) {
            const data = {
                ticketsId: newTicketData.id,
                customerId: reqBody.customerId,
                userId: reqBody.userId,
                description: reqBody.discription,
                newStatus: reqBody.status,
            };

            let newTicketLogData = await createNewTicketLog(data);

            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.TICKET.TICKET_ADDED,
                success: true,
                data: newTicketData,
            });
        } else {
            return res.status(STATUS_CODES.SERVER_ERROR).json({
                message: error.message,
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

const updateTicket = async (req, res) => {
    try {
        const reqBody = req.body.data;
        const { id } = req.body.data;

        let updateTicket = await updateTicketData(id, reqBody, req);
        if (updateTicket) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.TICKET.TICKET_UPDATE,
                success: true,
                data: updateTicket,
            });
        } else {
            return res.status(STATUS_CODES.SERVER_ERROR).json({
                message: error.message,
                success: false,
                data: {},
            });
        }
    } catch (error) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: error.message,
            success: false,
            data: {},
        });
    }
};

const getTickets = async (req, res) => {
    try {
        const {
            id,
            page,
            perPage,
            searchFilter,
            status,
            priority,
            sortOrder,
            orderBy,
            dateRange,
            duration,
            permission,
            userId,
            departmentId,
            customerId,
            slug
        } = req.body.data;
        let ticketData = await getTicketList(
            id,
            page,
            perPage,
            searchFilter,
            status,
            priority,
            sortOrder,
            orderBy,
            userId,
            customerId,
            dateRange,
            duration,
            permission,
            departmentId,
            slug
        );
        if (ticketData) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.TICKET.TICKET_FETCH,
                success: true,
                data: { ...ticketData },
            });
        } else {
            return res.status(STATUS_CODES.SERVER_ERROR).json({
                message: MESSAGES.TICKET.TICKET_FETCH_FAILED,
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

const exportAllTickets = async (req, res) => {
    try {
        const reqBody = req.body.data;
        const result = await exportTickets(reqBody);
        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message:
                    MESSAGES.TICKET.TICKET_FETCH,
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

const removeTicketsExcel = async (req, res) => {
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

const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { statusId } = req.body.data;
        const result = await updateStatusById(id, statusId, req);
        if (result) {
            // const updateStatusLog = await updateTicketLogStatus(id, statusId);
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.TICKET.TICKET_UPDATE,
                success: true,
                data: result,
            });
        } else {
            return res.status(STATUS_CODES.SERVER_ERROR).json({
                message: error.message,
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

const updatePriority = async (req, res) => {
    try {
        const { id } = req.params;
        const { priorityId } = req.body.data;
        const result = await updatePriorityById(id, priorityId);
        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.TICKET.TICKET_UPDATE,
                success: true,
                data: result,
            });
        } else {
            return res.status(STATUS_CODES.SERVER_ERROR).json({
                message: error.message,
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

const updateAssignTo = async (req, res) => {
    try {
        const { id } = req.params;
        const { assignToUserId } = req.body.data;
        const result = await updateAssignUserId(id, assignToUserId, req);
        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.TICKET.TICKET_UPDATE,
                success: true,
                data: result,
            });
        } else {
            return res.status(STATUS_CODES.SERVER_ERROR).json({
                message: error.message,
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

const sendMessage = async (req, res) => {
    try {
        const requestBody = req.body.data;
        const result = await sendNewMessage(requestBody, req);
        if (result) {
            const data = await updateTicketById(requestBody.ticketId);
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.TICKET.TICKET_SEND_MSG,
                success: true,
                data: { ...result },
            });
        } else {
            return res.status(STATUS_CODES.SERVER_ERROR).json({
                message: error.message,
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

const replayMessage = async (req, res) => {
    try {
        const { parentId, userId, replayMessage } = req.body.data;
    } catch (error) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: MESSAGES.SERVER_ERROR,
            success: false,
            data: {},
        });
    }
};

const getTicketChat = async (req, res) => {
    try {
        const { ticketId, customerId } = req.body.data;

        const result = await getTicketChatData(ticketId, customerId);
        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.TICKET.TICKET_CHAT_FETCH,
                success: true,
                data: { ...result },
            });
        } else {
            return res.status(STATUS_CODES.SERVER_ERROR).json({
                message: MESSAGES.TICKET.TICKET_CHAT_FETCH_FAILED,
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

const getTicketLogs = async (req, res) => {
    try {
        const { ticketId, customerId } = req.body.data;

        const result = await getTicketLogsData(ticketId, customerId);
        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.TICKET.TICKET_LOGS_FETCH,
                success: true,
                data: { ...result },
            });
        } else {
            return res.status(STATUS_CODES.SERVER_ERROR).json({
                message: MESSAGES.TICKET.TICKET_LOGS_FETCH_FAILED,
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
const getTicketCountStatusWise = async (req, res) => {
    try {
        const { departmentId } = req.body.data;

        const result = await TicketCountStatusWise(departmentId);
        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.TICKET.TICKET_STATUS_COUNT_FETCH,
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

const getAllTickets = async (req, res) => {
    try {
        let ticketData = await getTicketAllList();
        if (ticketData) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.TICKET.TICKET_FETCH,
                success: true,
                data: { ...ticketData },
            });
        } else {
            return res.status(STATUS_CODES.SERVER_ERROR).json({
                message: MESSAGES.TICKET.TICKET_FETCH_FAILED,
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

const lastActivity = async (req, res) => {
    try {
      const { id } = req.body.data;
  
      const latestActivityDate = await getLatestActivityDate(id);
  
      if (!latestActivityDate) {
        return res.status(STATUS_CODES.NOT_FOUND).json({
          message: MESSAGES.TICKET.TICKET_ID_NOT_FOUND,
          success: false,
          data: {},
        });
      }
  
      const result = {
        lastActivity: latestActivityDate,
      };
  
      return res.status(200).json(result);
    } catch (error) {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.SERVER_ERROR,
        success: false,
        data: {},
      });
    }
  };

const deleteCustomerData = async (req, res) => {
    const { customerId, name, email, ipAddress } = req.body.data;
    try {
      // Begin a transaction for atomicity
      const transaction = await ticketsModel.sequelize.transaction();
  
      try {
  
        // Disable foreign key checks
        await ticketsModel.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { transaction });
  
        // Delete related data from other models
        await ticketChatModel.destroy({ where: { customerId }, transaction });
        await ticketsLogModel.destroy({ where: { customerId }, transaction });
  
        // Delete the customer record
        await ticketsModel.destroy({ where: { customerId }, transaction });
  
        // Re-enable foreign key checks
        await ticketsModel.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { transaction });
  
        // Commit the transaction
        await transaction.commit();

        try {
            const auditLogBody = {
                recordId: customerId,
                action: `Customer ( ${name} - ${email} ) ticket data deleted successfully`,
                moduleName: "Ticket Service",
                newValue: JSON.stringify({
                    customerId: customerId,
                    name: name,
                    email: email
                }),
                oldValue: "N/A",
                type: "2",
                userId: null,
                customerId,
                ipAddress,
            };
            await axios.post(`${process.env.USERSERVICE}auditLog/create`, {
              data: auditLogBody,
            });
          } catch (error) {
            console.error(error);
          }

        return res.status(STATUS_CODES.SUCCESS).json({
          message: 'Data deleted successfully',
          success: true,
          data: {},
        });
      } catch (error) {
        // Rollback transaction in case of error
        await transaction.rollback();

        try {
            const auditLogBody = {
                recordId: customerId,
                action: `Customer ( ${name} - ${email} ) document data delete failed`,
                moduleName: "Ticket Service",
                newValue: JSON.stringify({
                customerId: customerId,
                name: name,
                email: email
                }),
                oldValue: "N/A",
                type: "2",
                userId: null,
                customerId,
                ipAddress,
            };
            await axios.post(`${process.env.USERSERVICE}auditLog/create`, {
              data: auditLogBody,
            });
          } catch (error) {
            console.error(error);
          }

        return res.status(STATUS_CODES.SERVER_ERROR).json({
          message: error.message,
          success: false,
          data: {},
        });
      }
    } catch (error) {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: error.message,
        success: false,
        data: {},
      });
    }
};

const reopenTicket =async (req,res) =>{
    try {
        const { ticketId, customerId,status,description } = req.body.data;
        const result = await reOpenTicketService(ticketId, customerId,status,description,req);

        if (result) {
            // await updateTicketLogStatus(ticketId,"4" );
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.TICKET.TICKET_UPDATE,
                success: true,
                data: result,
            });
        } else {
            return res.status(STATUS_CODES.SERVER_ERROR).json({
                message: MESSAGES.SERVER_ERROR,
                success: false,
                data: {},
            });
        }
    } catch (error) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: error.message,
            success: false,
            data: {},
        });
    }
}
  

module.exports = {
    createTicket,
    updateTicket,
    getTickets,
    updateStatus,
    updatePriority,
    updateAssignTo,
    sendMessage,
    replayMessage,
    getTicketChat,
    getTicketLogs,
    exportAllTickets,
    removeTicketsExcel,
    getTicketCountStatusWise,
    getAllTickets,
    lastActivity,
    deleteCustomerData,
    reopenTicket
};
