package com.techshop.config;

import com.techshop.entity.ERole;
import com.techshop.entity.Role;
import com.techshop.entity.User;
import com.techshop.repository.RoleRepository;
import com.techshop.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;

    public DataInitializer(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder encoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Initialize Roles
        if (roleRepository.findByName(ERole.ROLE_CLIENT).isEmpty()) {
            roleRepository.save(new Role(null, ERole.ROLE_CLIENT));
        }
        if (roleRepository.findByName(ERole.ROLE_ADMIN).isEmpty()) {
            roleRepository.save(new Role(null, ERole.ROLE_ADMIN));
        }
        if (roleRepository.findByName(ERole.ROLE_SOUS_ADMIN).isEmpty()) {
            roleRepository.save(new Role(null, ERole.ROLE_SOUS_ADMIN));
        }

        // Initialize Admin User if not exists
        if (!userRepository.existsByEmail("admin@techshop.com")) {
            User admin = new User("Admin TechShop", "admin@techshop.com", encoder.encode("admin123"));
            Set<Role> roles = new HashSet<>();
            roles.add(roleRepository.findByName(ERole.ROLE_ADMIN).get());
            admin.setRoles(roles);
            userRepository.save(admin);
        }
    }
}
