package com.example.bnk_project_01.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.bnk_project_01.dto.TermsDto;
import com.example.bnk_project_01.entity.Terms;
import com.example.bnk_project_01.repository.TermsRepository;
import com.example.bnk_project_01.util.TermsConverter;

@Service
@Transactional
public class TermsService {
    @Autowired
    TermsRepository termsRepository;
    
    private final String UPLOAD_PATH = "src/main/resources/static/termspdf/";

    public List<TermsDto> getAll() {
        return termsRepository.findAll()
                .stream()
                .map(TermsConverter::toDto)
                .collect(Collectors.toList());
    }

    public TermsDto save(TermsDto termsDto) {
        Terms terms = TermsConverter.toEntity(termsDto);
        
        if (terms.getTno() == null || terms.getTno().isEmpty()) {
            terms.setTno(generateNextTno());
            terms.setTcreatedate(LocalDate.now());
        }
        
        Terms savedTerms = termsRepository.save(terms);
        return TermsConverter.toDto(savedTerms);
    }
    
    public TermsDto saveWithFile(TermsDto termsDto, MultipartFile file) throws IOException {
        List<Terms> existingTerms = termsRepository.findByTnameOrderByTcreatedateDesc(termsDto.getTname());
        
        if (!existingTerms.isEmpty()) {
            existingTerms.forEach(term -> {
                term.setTstate("N");
                termsRepository.save(term);
            });
        }
        
        String savedFileName = saveFileWithVersion(file, termsDto.getTname());
        
        Terms terms = TermsConverter.toEntity(termsDto);
        terms.setTno(generateNextTno());
        terms.setTpath("/termspdf/" + savedFileName);
        terms.setTfilename(savedFileName);
        terms.setTstate("Y");
        terms.setTcreatedate(LocalDate.now());
        
        Terms savedTerms = termsRepository.save(terms);
        return TermsConverter.toDto(savedTerms);
    }
    
    private String saveFileWithVersion(MultipartFile file, String termsName) throws IOException {
        String originalFileName = file.getOriginalFilename();
        String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        String baseFileName = originalFileName.substring(0, originalFileName.lastIndexOf("."));
        
        Path uploadPath = Paths.get(UPLOAD_PATH);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        String finalFileName = originalFileName;
        Path filePath = uploadPath.resolve(finalFileName);
        
        if (!Files.exists(filePath)) {
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            return finalFileName;
        }
        
        int version = 2;
        do {
            finalFileName = baseFileName + " (" + version + ")" + fileExtension;
            filePath = uploadPath.resolve(finalFileName);
            version++;
        } while (Files.exists(filePath));
        
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        return finalFileName;
    }

    public void delete(String id) {
        termsRepository.findById(id).ifPresent(terms -> {
            termsRepository.deleteById(id);
            
            deleteFile(terms.getTfilename());
        });
    }
    
    private void deleteFile(String fileName) {
        if (fileName == null || fileName.isEmpty()) {
            return;
        }
        
        try {
            Path filePath = Paths.get(UPLOAD_PATH + fileName);
            
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                System.out.println("파일 삭제 완료: " + fileName);
            } else {
                System.out.println("파일이 존재하지 않음: " + fileName);
            }
        } catch (IOException e) {
            System.err.println("파일 삭제 실패: " + fileName);
            e.printStackTrace();
        }
    }
    
    public boolean deleteWithFileCheck(String id) {
        try {
            Terms terms = termsRepository.findById(id).orElse(null);
            if (terms == null) {
                return false;
            }
            
            termsRepository.deleteById(id);
            
            if (terms.getTfilename() != null && !terms.getTfilename().isEmpty()) {

                List<Terms> otherTermsWithSameFile = termsRepository.findByTfilename(terms.getTfilename());
                
                if (otherTermsWithSameFile.isEmpty()) {
 
                    deleteFile(terms.getTfilename());
                } else {
                    System.out.println("다른 약관에서 사용 중인 파일이므로 삭제하지 않음: " + terms.getTfilename());
                }
            }
            
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    
    private String generateNextTno() {
        String maxTno = termsRepository.findMaxTno();
        
        if (maxTno == null) {
            return "T001";
        }
        
        String numberPart = maxTno.substring(1);
        int nextNumber = Integer.parseInt(numberPart) + 1;
        
        return String.format("T%03d", nextNumber);
    }
    
    public TermsDto findById(String tno) {
        return termsRepository.findById(tno)
                .map(TermsConverter::toDto)
                .orElse(null);
    }
    
    public TermsDto update(String tno, TermsDto termsDto) {
        return termsRepository.findById(tno)
                .map(existingTerms -> {
                    Terms updatedTerms = TermsConverter.toEntity(termsDto);
                    updatedTerms.setTno(tno);
                    updatedTerms.setTcreatedate(existingTerms.getTcreatedate());
                    
                    Terms savedTerms = termsRepository.save(updatedTerms);
                    return TermsConverter.toDto(savedTerms);
                })
                .orElse(null);
    }
}