package com.techshop;

import com.techshop.config.DataInitializer;
import com.techshop.config.WebSecurityConfig;
import com.techshop.controller.AdminController;
import com.techshop.controller.AuthController;
import com.techshop.controller.CartController;
import com.techshop.controller.CategoryController;
import com.techshop.controller.ColorController;
import com.techshop.controller.DeliveryAddressController;
import com.techshop.controller.OrderController;
import com.techshop.controller.ProductController;
import com.techshop.controller.ReviewController;
import com.techshop.controller.SizeController;
import com.techshop.repository.CartRepository;
import com.techshop.repository.CategoryRepository;
import com.techshop.repository.ColorRepository;
import com.techshop.repository.DeliveryAddressRepository;
import com.techshop.repository.OrderItemRepository;
import com.techshop.repository.OrderRepository;
import com.techshop.repository.ProductRepository;
import com.techshop.repository.ProductSizeRepository;
import com.techshop.repository.ReviewRepository;
import com.techshop.repository.RoleRepository;
import com.techshop.repository.SizeRepository;
import com.techshop.repository.UserRepository;
import com.techshop.security.jwt.AuthTokenFilter;
import com.techshop.security.jwt.JwtUtils;
import com.techshop.security.services.UserDetailsServiceImpl;
import com.techshop.service.CartService;
import com.techshop.service.CategoryService;
import com.techshop.service.ColorService;
import com.techshop.service.EmailService;
import com.techshop.service.OrderService;
import com.techshop.service.ProductService;
import com.techshop.service.ReviewService;
import com.techshop.service.SizeService;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.mail.javamail.JavaMailSender;

import static org.mockito.Mockito.mock;

class ConstructorInjectionTest {

    @Test
    void shouldCreateAllConstructorInjectedComponents() {
        ProductRepository productRepository = mock(ProductRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        CategoryRepository categoryRepository = mock(CategoryRepository.class);
        SizeRepository sizeRepository = mock(SizeRepository.class);
        ColorRepository colorRepository = mock(ColorRepository.class);
        CartRepository cartRepository = mock(CartRepository.class);
        OrderRepository orderRepository = mock(OrderRepository.class);
        OrderItemRepository orderItemRepository = mock(OrderItemRepository.class);
        ProductSizeRepository productSizeRepository = mock(ProductSizeRepository.class);
        RoleRepository roleRepository = mock(RoleRepository.class);
        DeliveryAddressRepository deliveryAddressRepository = mock(DeliveryAddressRepository.class);
        ReviewRepository reviewRepository = mock(ReviewRepository.class);
        EmailService emailService = new EmailService(mock(JavaMailSender.class), "sender@example.com");
        UserDetailsServiceImpl userDetailsService = new UserDetailsServiceImpl(userRepository);
        JwtUtils jwtUtils = mock(JwtUtils.class);

        new DataInitializer(roleRepository, userRepository, mock(PasswordEncoder.class));
        new WebSecurityConfig(userDetailsService, jwtUtils);
        new AuthTokenFilter(jwtUtils, userDetailsService);
        new UserDetailsServiceImpl(userRepository);
        new AdminController(orderRepository, orderItemRepository, productRepository, productSizeRepository,
                userRepository, roleRepository);
        new AuthController(mock(AuthenticationManager.class), userRepository, roleRepository,
                mock(PasswordEncoder.class), jwtUtils);
        new CartController(new CartService(cartRepository, productRepository, userRepository));
        new CategoryController(new CategoryService(categoryRepository));
        new ColorController(new ColorService(colorRepository));
        new DeliveryAddressController(deliveryAddressRepository);
        new OrderController(new OrderService(orderRepository, cartRepository, productRepository, userRepository,
                deliveryAddressRepository, emailService));
        new ProductController(new ProductService(productRepository, categoryRepository, sizeRepository, colorRepository));
        new ReviewController(new ReviewService(reviewRepository, productRepository, userRepository));
        new SizeController(new SizeService(sizeRepository));
    }
}