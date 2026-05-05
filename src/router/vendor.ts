import { Router, Request, Response } from 'express';
import {
  createVendor,
  getVendor,
  getVendorByUserId,
  getAllVendors,
  updateVendor,
  deleteVendor,
  verifyVendor,
  updateVendorRating,
  uploadVendorProfileImage,
  uploadVendorPortfolioImages,
} from '../controller/vendor.controller';
import {
  createVendorServicePackage,
  getVendorServicePackages,
  getVendorServicePackage,
  updateVendorServicePackage,
  deleteVendorServicePackage,
} from '../controller/vendor-package.controller';
import { uploadMultipleImages, uploadSingleImage, uploadVendorAssets } from '../middleware/upload';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /vendors:
 *   post:
 *     summary: Create a new vendor profile
 *     description: Create a new vendor profile for a user using multipart form data. Images are uploaded to Cloudinary from the same form submission.
 *     tags:
 *       - Vendors
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - businessName
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "cuid1234567890"
 *               businessName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: "Creative Events Rwanda"
 *               bio:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Professional event organizing company with 5 years experience"
 *               experienceYears:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 5
 *               location:
 *                 type: string
 *                 maxLength: 200
 *                 example: "Kigali, Rwanda"
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Optional profile image file uploaded to Cloudinary
 *               portfolioImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Optional portfolio image files uploaded to Cloudinary
 *               certifications:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Repeat the field or send a JSON array string
 *                 example: ["Certified Wedding Planner", "Project Management Professional"]
 *               awards:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Repeat the field or send a JSON array string
 *                 example: ["Best Event Stylist 2025", "Top Wedding Vendor Kigali"]
 *     responses:
 *       201:
 *         description: Vendor profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error
 *       409:
 *         description: Vendor profile already exists for this user
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate, uploadVendorAssets, createVendor);

/**
 * @swagger
 * /vendors:
 *   get:
 *     summary: Get vendors
 *     description: Returns verified vendors to all authenticated users. Admins can see all vendors (verified and unverified) and filter by isVerified.
 *     tags:
 *       - Vendors
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *         description: "Filter by verification status (admin only; non-admins always receive verified vendors)"
 *         example: true
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Vendors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Vendor'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalCount:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticate, getAllVendors);

/**
 * @swagger
 * /vendors/{id}:
 *   get:
 *     summary: Get vendor profile by ID
 *     description: Retrieve a specific vendor profile using their ID
 *     tags:
 *       - Vendors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor ID
 *         example: "cuid1234567890"
 *     responses:
 *       200:
 *         description: Vendor profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Vendor'
 *       404:
 *         description: Vendor not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticate, getVendor);

/**
 * @swagger
 * /vendors/by-user/{userId}:
 *   get:
 *     summary: Get vendor profile by User ID
 *     description: Retrieve vendor profile by the associated user ID
 *     tags:
 *       - Vendors
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "cuid1234567890"
 *     responses:
 *       200:
 *         description: Vendor profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Vendor'
 *       404:
 *         description: Vendor profile not found for this user
 *       500:
 *         description: Internal server error
 */
router.get('/by-user/:userId', authenticate, getVendorByUserId);

/**
 * @swagger
 * /vendors/{id}:
 *   put:
 *     summary: Update vendor profile
 *     description: Update vendor profile information using multipart form data. Images are uploaded to Cloudinary from the same form submission.
 *     tags:
 *       - Vendors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               businessName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               bio:
 *                 type: string
 *                 maxLength: 500
 *               experienceYears:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *               location:
 *                 type: string
 *                 maxLength: 200
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Optional profile image file uploaded to Cloudinary
 *               portfolioImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Optional portfolio image files uploaded to Cloudinary
 *               certifications:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Repeat the field or send a JSON array string
 *               awards:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Repeat the field or send a JSON array string
 *     responses:
 *       200:
 *         description: Vendor profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Vendor'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Vendor not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticate, uploadVendorAssets, updateVendor);

/**
 * @swagger
 * /vendors/{id}:
 *   delete:
 *     summary: Delete vendor profile
 *     description: Delete a vendor profile permanently
 *     tags:
 *       - Vendors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor ID
 *     responses:
 *       200:
 *         description: Vendor profile deleted successfully
 *       404:
 *         description: Vendor not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticate, deleteVendor);

/**
 * @swagger
 * /vendors/{id}/verify:
 *   patch:
 *     summary: Update vendor verification status (Admin only)
 *     description: Set a vendor profile verification status to true or false. This action is restricted to admin users only.
 *     tags:
 *       - Vendors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isVerified
 *             properties:
 *               isVerified:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Vendor verification status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Vendor'
 *       400:
 *         description: Invalid verification status
 *       404:
 *         description: Vendor not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/verify', authenticate, authorize('admin'), verifyVendor);

/**
 * @swagger
 * /vendors/{id}/rating:
 *   patch:
 *     summary: Update vendor rating
 *     description: Update the average rating for a vendor
 *     tags:
 *       - Vendors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *                 example: 4.5
 *     responses:
 *       200:
 *         description: Vendor rating updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Vendor'
 *       400:
 *         description: Invalid rating value
 *       404:
 *         description: Vendor not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/rating', authenticate, updateVendorRating);

/**
 * @swagger
 * /vendors/{id}/profile-image:
 *   post:
 *     summary: Upload or update vendor profile image
 *     description: Upload a vendor profile image file using multipart form data. The file is stored in Cloudinary and the profileImage URL is saved on the vendor.
 *     tags:
 *       - Vendors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload. Form field name must be image.
 *     responses:
 *       200:
 *         description: Vendor profile image updated successfully
 *       400:
 *         description: No image provided
 *       404:
 *         description: Vendor not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/profile-image', authenticate, uploadSingleImage, uploadVendorProfileImage);

/**
 * @swagger
 * /vendors/{id}/portfolio-images:
 *   post:
 *     summary: Upload vendor portfolio images
 *     description: Upload one or more vendor portfolio images using multipart form data. Files are stored in Cloudinary and appended to the vendor portfolioImages list.
 *     tags:
 *       - Vendors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Portfolio image files to upload. Form field name must be images.
 *     responses:
 *       200:
 *         description: Vendor portfolio images uploaded successfully
 *       400:
 *         description: No images provided
 *       404:
 *         description: Vendor not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/portfolio-images', authenticate, uploadMultipleImages, uploadVendorPortfolioImages);

/**
 * @swagger
 * /vendors/{userId}/packages:
 *   post:
 *     summary: Create a vendor service package
 *     description: Add a service package to a vendor's portfolio for the given user.
 *     tags:
 *       - Vendor Service Packages
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (vendor owner)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - title
 *               - minPrice
 *               - maxPrice
 *             properties:
 *               category:
 *                 type: string
 *                 example: "Photography"
 *               title:
 *                 type: string
 *                 example: "Wedding photography full-day package"
 *               description:
 *                 type: string
 *                 example: "Includes 10 hours of coverage, edited photos, and online gallery."
 *               minPrice:
 *                 type: number
 *                 example: 300000
 *               maxPrice:
 *                 type: number
 *                 example: 600000
 *     responses:
 *       201:
 *         description: Vendor service package created successfully
 *       400:
 *         description: Validation error or invalid price range
 *       404:
 *         description: Vendor profile not found for this user
 *       500:
 *         description: Internal server error
 */
router.post('/:userId/packages', authenticate, createVendorServicePackage);

/**
 * @swagger
 * /vendors/{userId}/packages:
 *   get:
 *     summary: Get all service packages for a vendor
 *     description: Retrieve all service packages belonging to a vendor user.
 *     tags:
 *       - Vendor Service Packages
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (vendor owner)
 *     responses:
 *       200:
 *         description: Vendor service packages retrieved successfully
 *       404:
 *         description: Vendor profile not found for this user
 *       500:
 *         description: Internal server error
 */
router.get('/:userId/packages', authenticate, getVendorServicePackages);

/**
 * @swagger
 * /vendors/{userId}/packages/{packageId}:
 *   get:
 *     summary: Get a single vendor service package
 *     description: Retrieve a specific service package for a vendor user.
 *     tags:
 *       - Vendor Service Packages
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (vendor owner)
 *       - in: path
 *         name: packageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Service package ID
 *     responses:
 *       200:
 *         description: Vendor service package retrieved successfully
 *       404:
 *         description: Vendor profile or service package not found
 *       500:
 *         description: Internal server error
 */
router.get('/:userId/packages/:packageId', authenticate, getVendorServicePackage);

/**
 * @swagger
 * /vendors/{userId}/packages/{packageId}:
 *   put:
 *     summary: Update a vendor service package
 *     description: Update details of an existing vendor service package for a vendor user.
 *     tags:
 *       - Vendor Service Packages
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (vendor owner)
 *       - in: path
 *         name: packageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Service package ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               minPrice:
 *                 type: number
 *               maxPrice:
 *                 type: number
 *     responses:
 *       200:
 *         description: Vendor service package updated successfully
 *       400:
 *         description: Validation error or invalid price range
 *       404:
 *         description: Vendor profile or service package not found
 *       500:
 *         description: Internal server error
 */
router.put('/:userId/packages/:packageId', authenticate, updateVendorServicePackage);

/**
 * @swagger
 * /vendors/{userId}/packages/{packageId}:
 *   delete:
 *     summary: Delete a vendor service package
 *     description: Remove a service package from a vendor user's portfolio.
 *     tags:
 *       - Vendor Service Packages
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (vendor owner)
 *       - in: path
 *         name: packageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Service package ID
 *     responses:
 *       200:
 *         description: Vendor service package deleted successfully
 *       404:
 *         description: Vendor profile or service package not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:userId/packages/:packageId', authenticate, deleteVendorServicePackage);

export default router;
