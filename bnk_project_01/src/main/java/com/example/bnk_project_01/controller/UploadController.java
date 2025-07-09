package com.example.bnk_project_01.controller;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.bnk_project_01.entity.Import;
import com.example.bnk_project_01.repository.ImportRepository;

import jakarta.servlet.http.HttpSession;

@Controller
public class UploadController {

	@Autowired
	private ImportRepository importRepository;

	private final String UPLOAD_ROOT = "uploads/";

	// ============================ 업로드 폼 ============================
	@GetMapping("/user/uploadForm")
	public String uploadForm(HttpSession session, Model model) {
		String username = (String) session.getAttribute("username");
		String role = (String) session.getAttribute("role");

		if (role == null || !"ROLE_CEO".equals(role)) {
			return "redirect:/login";
		}

		model.addAttribute("username", username);

		List<Import> imports = importRepository.findByUsername(username);

		Import invoiceImport = findImport(imports, "INVOICE");
		Import plImport = findImport(imports, "PL");
		Import blImport = findImport(imports, "BL");

		model.addAttribute("invoiceImport", invoiceImport);
		model.addAttribute("plImport", plImport);
		model.addAttribute("blImport", blImport);

		model.addAttribute("hasInvoice", invoiceImport != null);
		model.addAttribute("hasPL", plImport != null);
		model.addAttribute("hasBL", blImport != null);

		return "user/uploadForm";
	}

	// ============================ 업로드 처리 ============================
	@PostMapping("/user/upload")
	public String handleUpload(@RequestParam("invoice") MultipartFile invoice, @RequestParam("pl") MultipartFile pl,
			@RequestParam("bl") MultipartFile bl, HttpSession session, Model model) throws IOException {

		String username = (String) session.getAttribute("username");
		String role = (String) session.getAttribute("role");

		if (username == null || role == null || !"ROLE_CEO".equals(role)) {
			return "redirect:/login";
		}

		if (!invoice.isEmpty()) {
			deleteExisting(username, "INVOICE");
			saveFile(invoice, "INVOICE", "Invoice 문서", username);
		}

		if (!pl.isEmpty()) {
			deleteExisting(username, "PL");
			saveFile(pl, "PL", "Packing List 문서", username);
		}

		if (!bl.isEmpty()) {
			deleteExisting(username, "BL");
			saveFile(bl, "BL", "Bill of Lading 문서", username);
		}

		model.addAttribute("message", "선택된 서류가 성공적으로 제출되었습니다.");
		return "redirect:/user/uploadForm";
	}

	// ============================ DB 삭제 ============================
	@GetMapping("/user/deleteFileDb")
	public String deleteDbOnly(@RequestParam("code") String filecode, HttpSession session) {
		String username = (String) session.getAttribute("username");
		String role = (String) session.getAttribute("role");

		if (username == null || !"ROLE_CEO".equals(role)) {
			return "redirect:/login";
		}

		List<Import> existing = importRepository.findByUsernameAndIfilecode(username, filecode);
		for (Import doc : existing) {
			importRepository.delete(doc); // DB만 삭제
		}

		return "redirect:/user/uploadForm";
	}

	// ============================ 유틸 함수 ============================
	private Import findImport(List<Import> imports, String code) {
		return imports.stream().filter(doc -> code.equals(doc.getIfilecode())).findFirst().orElse(null);
	}

	private void deleteExisting(String username, String filecode) {
		List<Import> existing = importRepository.findByUsernameAndIfilecode(username, filecode);
		for (Import doc : existing) {
			try {
				Files.deleteIfExists(Paths.get(doc.getIpath())); // 파일 삭제
			} catch (IOException e) {
				e.printStackTrace();
			}
			importRepository.delete(doc); // DB 삭제
		}
	}

	private void saveFile(MultipartFile file, String code, String description, String username) throws IOException {
		if (file.isEmpty())
			return;

		// ===================== ino 자동 증가 로직 =====================
		String newIno = "IM001";
		Import lastRecord = importRepository.findTopByOrderByInoDesc();
		if (lastRecord != null && lastRecord.getIno() != null && lastRecord.getIno().startsWith("IM")) {
			try {
				int lastNum = Integer.parseInt(lastRecord.getIno().substring(2));
				newIno = String.format("IM%03d", lastNum + 1);
			} catch (NumberFormatException e) {
			}
		}

		// ===================== 파일 저장 로직 =====================
		String originalFilename = file.getOriginalFilename();
		String uuid = UUID.randomUUID().toString();
		String newFilename = uuid + "_" + originalFilename;
		String userDir = UPLOAD_ROOT + username;

		Files.createDirectories(Paths.get(userDir));
		Path fullPath = Paths.get(userDir, newFilename);
		file.transferTo(fullPath);

		Import record = new Import();
		record.setIno(newIno);
		record.setUsername(username);
		record.setIfilecode(code);
		record.setIpath(userDir + "/" + newFilename);
		record.setIname(originalFilename);
		record.setIinfo(description);
		record.setIstatus("제출됨");
		record.setIcreatedate(LocalDateTime.now());
		record.setImodifydate(LocalDateTime.now());

		importRepository.save(record);
	}
}
