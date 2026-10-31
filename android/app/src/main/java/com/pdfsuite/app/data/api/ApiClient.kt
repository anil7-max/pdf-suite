package com.pdfsuite.app.data.api

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {
    // 10.0.2.2 connects from Android Emulator to localhost on host PC
    // Change to your PC's Wi-Fi IP (e.g. 192.168.1.X) when testing on a physical phone
    var baseUrl: String = "http://10.0.2.2:8000/"
        set(value) {
            field = value
            _apiService = null
        }

    private val logging = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(logging)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .build()

    private var _apiService: PdfSuiteApiService? = null

    val apiService: PdfSuiteApiService
        get() {
            if (_apiService == null) {
                _apiService = Retrofit.Builder()
                    .baseUrl(baseUrl)
                    .client(okHttpClient)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build()
                    .create(PdfSuiteApiService::class.java)
            }
            return _apiService!!
        }
}
