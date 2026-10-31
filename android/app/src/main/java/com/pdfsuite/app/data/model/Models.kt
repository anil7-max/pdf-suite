package com.pdfsuite.app.data.model

import com.google.gson.annotations.SerializedName

data class UserDto(
    val id: Int,
    @SerializedName("phone_number") val phoneNumber: String?,
    val email: String?,
    val role: String,
    @SerializedName("tokens_balance") val tokensBalance: Int? = 7,
    @SerializedName("is_premium") val isPremium: Boolean,
    val quota: QuotaDto?
)

data class QuotaDto(
    val limit: Int? = 7,
    @SerializedName("tokens_balance") val tokensBalance: Int? = 7,
    @SerializedName("used_today") val usedToday: Int? = 0,
    @SerializedName("remaining_today") val remainingToday: Int? = 7
)

data class TokenStatusResponse(
    @SerializedName("tokens_balance") val tokensBalance: Int,
    @SerializedName("is_super_admin") val isSuperAdmin: Boolean,
    val tasks: List<TaskItemDto>
)

data class TaskItemDto(
    val id: String,
    val title: String,
    @SerializedName("title_ml") val titleMl: String,
    @SerializedName("reward_tokens") val rewardTokens: Int,
    val badge: String,
    val description: String,
    @SerializedName("description_ml") val descriptionMl: String,
    @SerializedName("is_claimed") val isClaimed: Boolean = false
)

data class ClaimTaskRequest(
    @SerializedName("task_id") val taskId: String,
    @SerializedName("feedback_text") val feedbackText: String? = null
)

data class ClaimTaskResponse(
    val status: String,
    @SerializedName("tokens_earned") val tokensEarned: Int,
    @SerializedName("tokens_balance") val tokensBalance: Int,
    val message: String,
    @SerializedName("message_ml") val messageMl: String?
)

data class SendOtpRequest(
    @SerializedName("phone_number") val phoneNumber: String
)

data class SendOtpResponse(
    val status: String,
    val message: String,
    @SerializedName("debug_otp") val debugOtp: String?
)

data class VerifyOtpRequest(
    @SerializedName("phone_number") val phoneNumber: String,
    val otp: String
)

data class AuthResponse(
    @SerializedName("access_token") val accessToken: String,
    @SerializedName("token_type") val tokenType: String,
    val user: UserDto
)

data class ConversionResponse(
    val status: String,
    @SerializedName("task_id") val taskId: Int,
    val filename: String,
    @SerializedName("download_url") val downloadUrl: String,
    @SerializedName("file_size") val fileSize: Long,
    val stats: CompressionStatsDto?
)

data class CompressionStatsDto(
    @SerializedName("initial_size") val initialSize: Long,
    @SerializedName("final_size") val finalSize: Long,
    @SerializedName("saved_percentage") val savedPercentage: Float
)

data class EmailLoginRequest(
    val email: String,
    val password: String
)

data class StoreReceiptRequest(
    val platform: String = "GOOGLE_PLAY",
    @SerializedName("purchase_token") val purchaseToken: String,
    @SerializedName("product_id") val productId: String
)
