package com.pdfsuite.app.data.api

import com.pdfsuite.app.data.model.*
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.*

interface PdfSuiteApiService {

    @POST("api/v1/auth/email-login")
    suspend fun emailLogin(@Body request: EmailLoginRequest): Response<AuthResponse>

    @POST("api/v1/auth/send-otp")
    suspend fun sendOtp(@Body request: SendOtpRequest): Response<SendOtpResponse>

    @POST("api/v1/auth/verify-otp")
    suspend fun verifyOtp(@Body request: VerifyOtpRequest): Response<AuthResponse>

    @GET("api/v1/auth/me")
    suspend fun getProfile(@Header("Authorization") token: String): Response<UserDto>

    @Multipart
    @POST("api/v1/convert/image-to-pdf")
    suspend fun imageToPdf(
        @Header("Authorization") token: String?,
        @Part files: List<MultipartBody.Part>
    ): Response<ConversionResponse>

    @Multipart
    @POST("api/v1/convert/compress-pdf")
    suspend fun compressPdf(
        @Header("Authorization") token: String?,
        @Part file: MultipartBody.Part,
        @Part("level") level: RequestBody
    ): Response<ConversionResponse>

    @Multipart
    @POST("api/v1/convert/file-to-zip")
    suspend fun fileToZip(
        @Header("Authorization") token: String?,
        @Part files: List<MultipartBody.Part>
    ): Response<ConversionResponse>

    @GET("api/v1/tokens/status")
    suspend fun getTokenStatus(
        @Header("Authorization") token: String
    ): Response<TokenStatusResponse>

    @POST("api/v1/tokens/claim")
    suspend fun claimTask(
        @Header("Authorization") token: String,
        @Body request: ClaimTaskRequest
    ): Response<ClaimTaskResponse>

    @POST("api/v1/subscription/verify-store-receipt")
    suspend fun verifyGooglePlayReceipt(
        @Header("Authorization") token: String,
        @Body request: StoreReceiptRequest
    ): Response<Any>
}
