package com.hipmap.global.util;

import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.PutObjectRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.bramp.ffmpeg.FFmpeg;
import net.bramp.ffmpeg.FFprobe;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
@Slf4j
@RequiredArgsConstructor    // final 멤버변수가 있으면 생성자 항목에 포함시킴
@Component
@Service
public class S3Util {

    private final AmazonS3Client amazonS3Client;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    // MultipartFile을 전달받아 File로 전환한 후 S3에 업로드
    public Map<String, String> upload(MultipartFile multipartFile, String dirName, Long userId) throws IOException, Exception{

        File uploadFile = convert(multipartFile)
                .orElseThrow(() -> new IllegalArgumentException("MultipartFile -> File 전환 실패"));
        return upload(uploadFile, dirName, userId);
    }

    private Map<String, String> upload(File uploadFile, String dirName, Long userId) throws Exception{
        System.out.println("dirName = " + dirName);
        String origName = uploadFile.getName();
        String ext = origName.substring(origName.lastIndexOf('.')); // 확장자
//        String saveFileName = userId+ "-" +getUuid() + ext; // 파일 저장 이름
        String saveFileNameExceptExt = userId+ "-" +getUuid(); // 파일 저장 이름
        String saveFileName = saveFileNameExceptExt + ext; // 파일 저장 이름
        boolean isMp4 = false;

//        FFmpeg ffmpeg = new FFmpeg("/var/bin/ffmpeg"); // ffmpge 리눅스 경로
//        FFprobe ffprobe = new FFprobe("/var/bin/ffprobe"); // ffprobe 리눅스 경로
//        FFmpeg ffmpeg = new FFmpeg("C:/ssafy/cd/ffmpeg-2022-11-03-git-5ccd4d3060-essentials_build/bin/ffmpeg"); // ffmpeg 로컬 경로
//        FFprobe ffprobe = new FFprobe("C:/ssafy/cd/ffmpeg-2022-11-03-git-5ccd4d3060-essentials_build/bin/ffprobe"); // ffmpeg 로컬 경로

//        if(!ext.equals(".png") && !ext.equals(".jpg") && !ext.equals(".mp4")) {
//            // 파일 생성
////            FileOutputStream fileStream = new FileOutputStream("/var/jenkins_home/encoding/origin/" + origName);
//            FileOutputStream fileStream = new FileOutputStream("C:/ssafy/cd/shorts/encoding" + origName);
//            ObjectOutputStream objectOutputStream = new ObjectOutputStream(fileStream);
//            objectOutputStream.writeObject(uploadFile);
////            objectOutputStream.close();
//
//            // 인코딩 로직
////            FFmpegBuilder builder = new FFmpegBuilder().setInput("/var/jenkins_home/encoding/origin/" + origName) //원본파일경로
////            FFmpegBuilder builder = new FFmpegBuilder().setInput("C:/ssafy/cd/shorts/encoding" + origName) //원본파일경로
//            FFmpegBuilder builder = new FFmpegBuilder().setInput(origName) //원본파일경로
//                    .overrideOutputFiles(true)
////                    .addOutput("/var/jenkins_home/encoding/result/" + saveFileNameExceptExt + ".mp4")//저장경로
//                    .addOutput("C:/ssafy/cd/shorts/encoding/result/" + saveFileNameExceptExt + ".mp4")//저장경로
//                    .setFilename("mp4")
//                    .setVideoCodec("libx264")
//                    .setStrict(FFmpegBuilder.Strict.EXPERIMENTAL)
//                    .done();
//            FFmpegExecutor executor = new FFmpegExecutor(ffmpeg, ffprobe);
//            executor.createJob(builder).run();
//            isMp4 = true;
//        }


        File encodingUploadFile = uploadFile;


        String uploadThumbnailUrl = null;
        if(dirName.equals("videos")) {
            File thumbnail = JCodecUtil.getThumbnail(encodingUploadFile, new File("/var/jenkins_home/thumbnail/" + saveFileNameExceptExt + ".png"));
            String thumbnailName = dirName + "/" + thumbnail.getName();
            uploadThumbnailUrl = putS3(thumbnail, thumbnailName);
            removeNewFile(thumbnail);
        }

        // uploadFile = 저장된 파일로 재지정
        String fileName = dirName + "/" + encodingUploadFile.getName();
//        String uploadImageUrl = putS3(uploadFile, fileName);
        String uploadImageUrl = putS3(encodingUploadFile, fileName);

        if(dirName.equals("images")) {
            uploadThumbnailUrl = uploadImageUrl;
        }

        removeNewFile(uploadFile);  // 로컬에 생성된 File 삭제 (MultipartFile -> File 전환 하며 로컬에 파일 생성됨)

        Map<String, String> result = new HashMap<>();

        result.put("uploadImageUrl", uploadImageUrl);
        result.put("uploadThumbnailUrl", uploadThumbnailUrl);

        return result;      // 업로드된 파일의 S3 URL 주소 반환
    }

    private String putS3(File uploadFile, String fileName) {
        amazonS3Client.putObject(
                new PutObjectRequest(bucket, fileName, uploadFile)
                        .withCannedAcl(CannedAccessControlList.PublicRead)	// PublicRead 권한으로 업로드 됨
        );
        return amazonS3Client.getUrl(bucket, fileName).toString();
    }

    private void removeNewFile(File targetFile) {
        if(targetFile.delete()) {
            log.info("파일이 삭제되었습니다.");
        }else {
            log.info("파일이 삭제되지 못했습니다.");
        }
    }

    private Optional<File> convert(MultipartFile file) throws  IOException {
        File convertFile = new File(file.getOriginalFilename());
        if(convertFile.createNewFile()) {
            try (FileOutputStream fos = new FileOutputStream(convertFile)) {
                fos.write(file.getBytes());
            }catch (Exception e) {
                e.printStackTrace();
            }
            return Optional.of(convertFile);
        }
        return Optional.empty();
    }

    public void delete(String source) {
        source = source.replace("https://hipmap.s3.ap-northeast-2.amazonaws.com/", "");
        try {
            source = URLDecoder.decode(source, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        deleteS3(source);
    }

    private void deleteS3(String source) {
        amazonS3Client.deleteObject(bucket, source);
    }
    private static String getUuid() {
        return UUID.randomUUID().toString().replaceAll("-", "");
    }
}