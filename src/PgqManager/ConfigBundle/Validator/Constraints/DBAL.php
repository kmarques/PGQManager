<?php
/**
 * Copyright (c) 2014 HiMedia Group
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @copyright 2014 HiMedia Group
 * @author Karl MARQUES <kmarques@hi-media.com>
 * @license Apache License, Version 2.0
 */

namespace PgqManager\ConfigBundle\Validator\Constraints;


use Symfony\Component\Validator\Constraint;

/**
 * Class DBAL
 * @package PgqManager\ConfigBundle\Validator\Constraints
 * @Annotation
 */
class DBAL extends Constraint
{

    public $message = '%string%';

    public function getTargets()
    {
        return self::CLASS_CONSTRAINT;
    }

    public function validatedBy()
    {
        return 'DBALConnection';
    }

}