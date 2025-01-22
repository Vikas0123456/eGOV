const knowledgeBaseModel = require("../models/knowledgebase");
const LikeDislikeModel = require("../models/likeDislike");
const { generateAuditLog, extractDataFromRequest } = require("./auditLog.service");

const likeDislikeKnowledgeBase = async (id, islike, customerId, req) => {
    try {
        const knowledgeBase = await knowledgeBaseModel.findByPk(id);
        if (!knowledgeBase) {
            return {
                success: false,
                message: "Knowledge base entry not found",
            };
        }

        let likeDislikeRecord = await LikeDislikeModel.findOne({
            where: {
                knowledgeBaseId: id,
                customerId: customerId,
            },
        });

        if (likeDislikeRecord) {
            likeDislikeRecord.islike = islike;
            await likeDislikeRecord.save();
        } else {
            await LikeDislikeModel.create({
                customerId: customerId,
                knowledgeBaseId: id,
                islike: islike,
            });
        }

        const { ipAddress } =
        extractDataFromRequest(req);
        try {
            await generateAuditLog(
                id,
              "Create",
              "Like-Dislike",
              islike,
              "N/A",
              "1",
              null,
              customerId,
              ipAddress
            );
          } catch (error) {
            console.error('Error generating audit log:', error);
          }

        return {
            success: true,
            message: `${islike === "1" ? "Liked" : "Disliked"} successfully`,
        };
    } catch (error) {
        console.error(error);
        throw new Error("Internal server error");
    }
};

const getLikeDislikeDetails = async (id, customerId) => {
    try {
        const knowledgeBaseData = await LikeDislikeModel.findAndCountAll({
            where: {
                knowledgeBaseId: id,
            },
            raw: true,
        });

        const totalCount = knowledgeBaseData.count;

        const likeCountResult = await LikeDislikeModel.count({
            where: { islike: "1", knowledgeBaseId: id },
        });

        const userLikeDislike = await LikeDislikeModel.findOne({
            where: { knowledgeBaseId: id, customerId: customerId },
        });


        let likedSlug = null;
        if (userLikeDislike) {
            if (userLikeDislike.islike === '0') {
                likedSlug = false
            } else {
                likedSlug = true
            }
        }

        const likeDislikeData = {
            isUserLiked: likedSlug,
            totalCount,
            likeCount: likeCountResult,
            rows: knowledgeBaseData.rows,
        };

        return likeDislikeData;
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
};



module.exports = {
    likeDislikeKnowledgeBase,
    getLikeDislikeDetails
};
